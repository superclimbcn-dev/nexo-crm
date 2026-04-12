import crypto from 'crypto'
import { Prisma, MessageStatus, MessageType } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ContactTriageStatus =
  | 'new'
  | 'waiting_reply'
  | 'interesse_sofas_alfombras'
  | 'interesse_impermeabilizacion'
  | 'interesse_carros'

type MenuOption = '1' | '2' | '3'
type SupportedMetaMessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'contacts'
  | 'unknown'

type ContactRecord = {
  id: string
  phoneNumber: string
  status: string
}

type ConversationRecord = {
  id: string
}

type IncomingMessageRecord = {
  id: string
  from: string
  type: SupportedMetaMessageType
  text?: {
    body: string
  }
  image?: {
    caption?: string
    link?: string
  }
  document?: {
    caption?: string
    link?: string
  }
  audio?: {
    link?: string
  }
  video?: {
    caption?: string
    link?: string
  }
}

type IncomingStatusRecord = {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp?: string
  errors?: Array<{
    message?: string
  }>
}

interface WhatsAppContactProfile {
  name?: string
}

interface WhatsAppValuePayload {
  contacts?: Array<{
    profile?: WhatsAppContactProfile
  }>
  messages?: IncomingMessageRecord[]
  statuses?: IncomingStatusRecord[]
}

interface WhatsAppChangePayload {
  value?: WhatsAppValuePayload
}

interface WhatsAppEntryPayload {
  changes?: WhatsAppChangePayload[]
}

interface WhatsAppPayload {
  entry?: WhatsAppEntryPayload[]
}

type AutomationRecord = Awaited<ReturnType<typeof fetchActiveAutomations>>[number]

const WELCOME_MENU = [
  'Olá! Bem-vindo ao Superclim.',
  'Escolha uma opção:',
  '1. Sofás/Alfombras',
  '2. Impermeabilização',
  '3. Carros',
].join('\n')

const INVALID_OPTION_MESSAGE = 'Opção inválida. Por favor, escolha 1, 2 ou 3.'

const MENU_SELECTIONS: Record<
  MenuOption,
  {
    nextStatus: Exclude<ContactTriageStatus, 'new' | 'waiting_reply'>
    confirmationMessage: string
  }
> = {
  '1': {
    nextStatus: 'interesse_sofas_alfombras',
    confirmationMessage:
      'Perfeito! Você escolheu Sofás/Alfombras. Agora, por favor, envie fotos para avaliarmos o serviço.',
  },
  '2': {
    nextStatus: 'interesse_impermeabilizacion',
    confirmationMessage:
      'Ótimo! Você escolheu Impermeabilização. Agora, por favor, envie fotos para avaliarmos o serviço.',
  },
  '3': {
    nextStatus: 'interesse_carros',
    confirmationMessage:
      'Perfeito! Você escolheu Carros. Agora, por favor, envie fotos para avaliarmos o serviço.',
  },
}

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) {
    return false
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expectedSignature}`))
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isIncomingMessageRecord(value: unknown): value is IncomingMessageRecord {
  if (!isObject(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.from === 'string' &&
    typeof value.type === 'string'
  )
}

function isIncomingStatusRecord(value: unknown): value is IncomingStatusRecord {
  if (!isObject(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.status === 'string' &&
    ['sent', 'delivered', 'read', 'failed'].includes(value.status)
  )
}

function validatePayload(payload: unknown): payload is WhatsAppPayload {
  if (!isObject(payload)) {
    return false
  }

  if (payload.entry === undefined) {
    return true
  }

  if (!Array.isArray(payload.entry)) {
    return false
  }

  return payload.entry.every((entry) => {
    if (!isObject(entry)) {
      return false
    }

    if (entry.changes === undefined) {
      return true
    }

    if (!Array.isArray(entry.changes)) {
      return false
    }

    return entry.changes.every((change) => {
      if (!isObject(change)) {
        return false
      }

      if (change.value === undefined) {
        return true
      }

      if (!isObject(change.value)) {
        return false
      }

      const { messages, statuses } = change.value

      const messagesAreValid =
        messages === undefined || (Array.isArray(messages) && messages.every(isIncomingMessageRecord))
      const statusesAreValid =
        statuses === undefined || (Array.isArray(statuses) && statuses.every(isIncomingStatusRecord))

      return messagesAreValid && statusesAreValid
    })
  })
}

function normalizePhoneNumber(phone: string): string {
  return phone.replace(/^whatsapp:/, '').trim()
}

function normalizeMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim()
}

function normalizeMetaMessageType(type: string): SupportedMetaMessageType {
  switch (type) {
    case 'text':
    case 'image':
    case 'document':
    case 'audio':
    case 'video':
    case 'location':
    case 'contacts':
      return type
    default:
      return 'unknown'
  }
}

function isAwaitingReply(status: string): boolean {
  return status === 'new' || status === 'waiting_reply'
}

function isMenuOption(message: string): message is MenuOption {
  return message === '1' || message === '2' || message === '3'
}

function mapMessageType(type: SupportedMetaMessageType): MessageType {
  const typeMap: Record<SupportedMetaMessageType, MessageType> = {
    text: 'TEXT',
    image: 'IMAGE',
    document: 'DOCUMENT',
    audio: 'AUDIO',
    video: 'VIDEO',
    location: 'LOCATION',
    contacts: 'CONTACT',
    unknown: 'TEXT',
  }

  return typeMap[type]
}

function extractMessageContent(message: IncomingMessageRecord): {
  content: string
  mediaUrl: string | null
  mediaType: string | null
} {
  switch (message.type) {
    case 'text':
      return {
        content: normalizeMessage(message.text?.body ?? ''),
        mediaUrl: null,
        mediaType: null,
      }
    case 'image':
      return {
        content: normalizeMessage(message.image?.caption ?? ''),
        mediaUrl: message.image?.link ?? null,
        mediaType: 'image',
      }
    case 'document':
      return {
        content: normalizeMessage(message.document?.caption ?? ''),
        mediaUrl: message.document?.link ?? null,
        mediaType: 'document',
      }
    case 'audio':
      return {
        content: '(Audio)',
        mediaUrl: message.audio?.link ?? null,
        mediaType: 'audio',
      }
    case 'video':
      return {
        content: normalizeMessage(message.video?.caption ?? ''),
        mediaUrl: message.video?.link ?? null,
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

function mapStatusUpdate(
  status: IncomingStatusRecord,
): {
  status: MessageStatus
  deliveredAt?: Date
  readAt?: Date
  failedAt?: Date
  errorMessage?: string
} {
  const timestamp =
    status.timestamp !== undefined && !Number.isNaN(Number(status.timestamp))
      ? new Date(Number(status.timestamp) * 1000)
      : undefined

  switch (status.status) {
    case 'sent':
      return { status: 'SENT' }
    case 'delivered':
      return {
        status: 'DELIVERED',
        deliveredAt: timestamp,
      }
    case 'read':
      return {
        status: 'READ',
        readAt: timestamp,
      }
    case 'failed':
      return {
        status: 'FAILED',
        failedAt: timestamp,
        errorMessage: status.errors?.[0]?.message,
      }
  }
}

async function parseWebhookBody(req: NextRequest): Promise<{ rawBody: string; payload: WhatsAppPayload }> {
  const rawBody = await req.text()
  const parsedBody: unknown = JSON.parse(rawBody)

  if (!validatePayload(parsedBody)) {
    throw new Error('Payload de webhook inválido')
  }

  return {
    rawBody,
    payload: parsedBody,
  }
}

async function findOrCreateContact(params: {
  rawPhoneNumber: string
  profileName: string | null
}): Promise<{ contact: ContactRecord; isNewContact: boolean }> {
  const phoneNumber = normalizePhoneNumber(params.rawPhoneNumber)

  const existingContact = await prisma.contact.findUnique({
    where: { phoneNumber },
    select: {
      id: true,
      phoneNumber: true,
      status: true,
    },
  })

  if (existingContact) {
    return {
      contact: existingContact,
      isNewContact: false,
    }
  }

  const createdContact = await prisma.contact.create({
    data: {
      phoneNumber,
      name: params.profileName,
      source: 'whatsapp',
      status: 'waiting_reply',
    },
    select: {
      id: true,
      phoneNumber: true,
      status: true,
    },
  })

  return {
    contact: createdContact,
    isNewContact: true,
  }
}

async function findOrCreateConversation(contactId: string): Promise<ConversationRecord> {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      contactId,
      status: { in: ['OPEN', 'PENDING'] },
    },
    orderBy: { lastMessageAt: 'desc' },
    select: { id: true },
  })

  if (existingConversation) {
    return existingConversation
  }

  return prisma.conversation.create({
    data: {
      contactId,
      source: 'whatsapp',
      status: 'OPEN',
    },
    select: { id: true },
  })
}

async function persistIncomingMessage(params: {
  conversationId: string
  whatsappMessageId: string
  type: SupportedMetaMessageType
  content: string
  mediaUrl: string | null
  mediaType: string | null
}): Promise<void> {
  const existingMessage = await prisma.message.findUnique({
    where: { whatsappId: params.whatsappMessageId },
    select: { id: true },
  })

  if (!existingMessage) {
    await prisma.message.create({
      data: {
        conversationId: params.conversationId,
        direction: 'INBOUND',
        type: mapMessageType(params.type),
        content: params.content,
        mediaUrl: params.mediaUrl,
        mediaType: params.mediaType,
        whatsappId: params.whatsappMessageId,
        status: 'DELIVERED',
      },
    })
  }

  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: { lastMessageAt: new Date() },
  })
}

async function updateContactStatus(contactId: string, status: ContactTriageStatus): Promise<void> {
  await prisma.contact.update({
    where: { id: contactId },
    data: { status },
  })
}

async function applyTriageStateMachine(contact: ContactRecord, messageContent: string): Promise<string | null> {
  if (!isAwaitingReply(contact.status)) {
    return null
  }

  if (!isMenuOption(messageContent)) {
    if (contact.status !== 'waiting_reply') {
      await updateContactStatus(contact.id, 'waiting_reply')
    }

    return INVALID_OPTION_MESSAGE
  }

  const selection = MENU_SELECTIONS[messageContent]

  await updateContactStatus(contact.id, selection.nextStatus)

  return selection.confirmationMessage
}

async function fetchActiveAutomations() {
  return prisma.automation.findMany({
    where: { isActive: true },
    select: {
      id: true,
      triggerType: true,
      triggerConfig: true,
    },
  })
}

function extractKeywords(triggerConfig: Prisma.JsonValue): string[] {
  if (
    typeof triggerConfig !== 'object' ||
    triggerConfig === null ||
    Array.isArray(triggerConfig) ||
    !('keywords' in triggerConfig)
  ) {
    return []
  }

  const keywords = triggerConfig.keywords

  if (!Array.isArray(keywords)) {
    return []
  }

  return keywords.filter((keyword): keyword is string => typeof keyword === 'string')
}

async function checkAutomations(params: {
  conversation: ConversationRecord
  contact: ContactRecord
  messageContent: string
}): Promise<void> {
  const automations = await fetchActiveAutomations()

  for (const automation of automations) {
    let shouldExecute = false

    switch (automation.triggerType) {
      case 'KEYWORD': {
        const keywords = extractKeywords(automation.triggerConfig)
        shouldExecute = keywords.some((keyword) =>
          params.messageContent.toLowerCase().includes(keyword.toLowerCase()),
        )
        break
      }
      case 'NEW_CONVERSATION': {
        const messageCount = await prisma.message.count({
          where: { conversationId: params.conversation.id },
        })
        shouldExecute = messageCount === 1
        break
      }
      case 'INACTIVITY':
      case 'SCHEDULE':
      case 'WEBHOOK':
        shouldExecute = false
        break
    }

    if (shouldExecute) {
      await executeAutomation(automation, params.conversation, params.contact)
    }
  }
}

async function executeAutomation(
  automation: AutomationRecord,
  conversation: ConversationRecord,
  contact: ContactRecord,
): Promise<void> {
  await prisma.automationLog.create({
    data: {
      automationId: automation.id,
      contactId: contact.id,
      conversationId: conversation.id,
      input: { message: 'Ativado' },
      output: { action: 'Executado' },
      success: true,
      executedAt: new Date(),
    },
  })

  await prisma.automation.update({
    where: { id: automation.id },
    data: { executionCount: { increment: 1 } },
  })
}

async function processIncomingMessage(
  message: IncomingMessageRecord,
  value: WhatsAppValuePayload,
): Promise<void> {
  const normalizedType = normalizeMetaMessageType(message.type)
  const profileName = value.contacts?.[0]?.profile?.name?.trim() || null
  const { contact, isNewContact } = await findOrCreateContact({
    rawPhoneNumber: message.from,
    profileName,
  })
  const conversation = await findOrCreateConversation(contact.id)
  const { content, mediaUrl, mediaType } = extractMessageContent({
    ...message,
    type: normalizedType,
  })

  await persistIncomingMessage({
    conversationId: conversation.id,
    whatsappMessageId: message.id,
    type: normalizedType,
    content,
    mediaUrl,
    mediaType,
  })

  const triageReply = normalizedType === 'text' ? await applyTriageStateMachine(contact, content) : null

  if (isNewContact) {
    console.log(`Novo contato ${contact.phoneNumber}: ${WELCOME_MENU}`)
  } else if (triageReply) {
    console.log(`Resposta de triagem para ${contact.phoneNumber}: ${triageReply}`)
  }

  await checkAutomations({
    conversation,
    contact,
    messageContent: content,
  })
}

async function processStatusUpdate(status: IncomingStatusRecord): Promise<void> {
  const message = await prisma.message.findUnique({
    where: { whatsappId: status.id },
    select: { id: true },
  })

  if (!message) {
    return
  }

  const updateData = mapStatusUpdate(status)

  await prisma.message.update({
    where: { id: message.id },
    data: updateData,
  })
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verificado')
    return new NextResponse(challenge)
  }

  return new NextResponse('Verificação falhou', { status: 403 })
}

export async function POST(req: NextRequest) {
  try {
    const { rawBody, payload } = await parseWebhookBody(req)
    const signature = req.headers.get('x-hub-signature-256')

    if (process.env.NODE_ENV === 'production') {
      const secret = process.env.WHATSAPP_WEBHOOK_SECRET || ''

      if (!verifySignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
      }
    }

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value

        if (!value) {
          continue
        }

        for (const message of value.messages ?? []) {
          await processIncomingMessage(message, value)
        }

        for (const status of value.statuses ?? []) {
          await processStatusUpdate(status)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'

    console.error('Erro no webhook do WhatsApp:', message)

    const statusCode = message === 'Payload de webhook inválido' ? 400 : 500

    return NextResponse.json(
      {
        error:
          statusCode === 400
            ? 'Payload inválido. Verifique a estrutura enviada pelo provedor.'
            : 'Erro interno do servidor',
      },
      { status: statusCode },
    )
  }
}
