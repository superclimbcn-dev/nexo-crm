import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MessageType, MessageStatus } from '@prisma/client'
import crypto from 'crypto'

// Verify webhook signature from Meta
function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  )
}

// GET handler for webhook verification
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified')
    return new NextResponse(challenge)
  }

  return new NextResponse('Verification failed', { status: 403 })
}

// POST handler for incoming messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-hub-signature-256')
    
    // Verify signature in production
    if (process.env.NODE_ENV === 'production') {
      const secret = process.env.WHATSAPP_WEBHOOK_SECRET || ''
      if (!verifySignature(body, signature, secret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(body)

    // Process each entry
    for (const entry of data.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value

        // Handle incoming messages
        if (value.messages) {
          for (const message of value.messages) {
            await processIncomingMessage(message, value)
          }
        }

        // Handle status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            await processStatusUpdate(status)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processIncomingMessage(whatsappMsg: any, value: any) {
  const phone = whatsappMsg.from
  const profile = value.contacts?.[0]?.profile

  // Find or create contact
  let contact = await prisma.contact.findUnique({
    where: { phone },
  })

  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        phone,
        name: profile?.name || null,
        source: 'whatsapp',
      },
    })
  }

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      contactId: contact.id,
      status: { in: ['OPEN', 'PENDING'] },
    },
    orderBy: { lastMessageAt: 'desc' },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        contactId: contact.id,
        source: 'whatsapp',
        status: 'OPEN',
      },
    })
  }

  // Extract message content based on type
  const { content, mediaUrl, mediaType } = extractMessageContent(whatsappMsg)

  // Save message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: 'INBOUND',
      type: mapMessageType(whatsappMsg.type),
      content,
      mediaUrl,
      mediaType,
      whatsappId: whatsappMsg.id,
      status: 'DELIVERED',
    },
  })

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  })

  // Check automations
  await checkAutomations(conversation, contact, content)
}

async function processStatusUpdate(status: any) {
  const whatsappId = status.id
  const messageStatus = status.status // sent, delivered, read, failed

  const message = await prisma.message.findUnique({
    where: { whatsappId },
  })

  if (!message) return

  const updateData: any = {
    status: messageStatus.toUpperCase() as MessageStatus,
  }

  if (messageStatus === 'delivered') {
    updateData.deliveredAt = new Date(status.timestamp * 1000)
  } else if (messageStatus === 'read') {
    updateData.readAt = new Date(status.timestamp * 1000)
  } else if (messageStatus === 'failed') {
    updateData.failedAt = new Date(status.timestamp * 1000)
    updateData.errorMessage = status.errors?.[0]?.message
  }

  await prisma.message.update({
    where: { id: message.id },
    data: updateData,
  })
}

function extractMessageContent(message: any): { content: string; mediaUrl: string | null; mediaType: string | null } {
  switch (message.type) {
    case 'text':
      return {
        content: message.text?.body || '',
        mediaUrl: null,
        mediaType: null,
      }
    case 'image':
      return {
        content: message.image?.caption || '',
        mediaUrl: message.image?.link || null,
        mediaType: 'image',
      }
    case 'document':
      return {
        content: message.document?.caption || '',
        mediaUrl: message.document?.link || null,
        mediaType: 'document',
      }
    case 'audio':
      return {
        content: '(Áudio)',
        mediaUrl: message.audio?.link || null,
        mediaType: 'audio',
      }
    case 'video':
      return {
        content: message.video?.caption || '',
        mediaUrl: message.video?.link || null,
        mediaType: 'video',
      }
    default:
      return {
        content: '(Mensagem não suportada)',
        mediaUrl: null,
        mediaType: null,
      }
  }
}

function mapMessageType(type: string): MessageType {
  const typeMap: Record<string, MessageType> = {
    text: 'TEXT',
    image: 'IMAGE',
    document: 'DOCUMENT',
    audio: 'AUDIO',
    video: 'VIDEO',
    location: 'LOCATION',
    contacts: 'CONTACT',
  }
  return typeMap[type] || 'TEXT'
}

async function checkAutomations(conversation: any, contact: any, messageContent: string) {
  // Get active automations
  const automations = await prisma.automation.findMany({
    where: { isActive: true },
  })

  for (const automation of automations) {
    let shouldExecute = false

    switch (automation.triggerType) {
      case 'KEYWORD': {
        const triggerConfig =
          automation.triggerConfig && typeof automation.triggerConfig === 'object' && !Array.isArray(automation.triggerConfig)
            ? (automation.triggerConfig as { keywords?: string[] })
            : {}
        const keywords = triggerConfig.keywords || []
        shouldExecute = keywords.some((kw: string) =>
          messageContent.toLowerCase().includes(kw.toLowerCase())
        )
        break
      }

      case 'NEW_CONVERSATION':
        // Check if this is the first message in conversation
        const messageCount = await prisma.message.count({
          where: { conversationId: conversation.id },
        })
        shouldExecute = messageCount === 1
        break

      case 'INACTIVITY':
        // This would be handled by a scheduled job
        break
    }

    if (shouldExecute) {
      await executeAutomation(automation, conversation, contact)
    }
  }
}

async function executeAutomation(automation: any, conversation: any, contact: any) {
  // Log execution
  await prisma.automationLog.create({
    data: {
      automationId: automation.id,
      contactId: contact.id,
      conversationId: conversation.id,
      input: { message: 'Triggered' },
      output: { action: 'Executed' },
      success: true,
      executedAt: new Date(),
    },
  })

  // Update execution count
  await prisma.automation.update({
    where: { id: automation.id },
    data: { executionCount: { increment: 1 } },
  })

  // TODO: Execute the actual flow actions
  // This would involve sending messages, updating deals, etc.
}
