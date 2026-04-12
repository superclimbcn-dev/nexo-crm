import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface WhatsAppPayload {
  From: string
  Body: string
  MessageSid: string
}

type MenuOption = '1' | '2' | '3'
type ContactTriageStatus =
  | 'new'
  | 'waiting_reply'
  | 'interesse_sofas_alfombras'
  | 'interesse_impermeabilizacion'
  | 'interesse_carros'

type ContactRecord = {
  id: string
  phoneNumber: string
  status: string
}

type ServiceSelection = {
  nextStatus: Exclude<ContactTriageStatus, 'new' | 'waiting_reply'>
  confirmationMessage: string
}

const WELCOME_MENU = [
  'Olá! Bem-vindo ao Superclim.',
  'Escolha uma opção:',
  '1. Sofás/Alfombras',
  '2. Impermeabilização',
  '3. Carros',
].join('\n')

const INVALID_OPTION_MESSAGE = 'Opção inválida. Por favor, escolha 1, 2 ou 3.'
const FALLBACK_MESSAGE = 'Obrigado pela sua mensagem. Em breve entraremos em contato.'
const MENU_SELECTIONS: Record<MenuOption, ServiceSelection> = {
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

function normalizeMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim()
}

function validatePayload(payload: unknown): payload is WhatsAppPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }

  const candidate = payload as Record<string, unknown>

  return (
    typeof candidate.From === 'string' &&
    typeof candidate.Body === 'string' &&
    typeof candidate.MessageSid === 'string'
  )
}

function normalizePhoneNumber(from: string): string {
  return from.replace(/^whatsapp:/, '').trim()
}

function isMenuOption(message: string): message is MenuOption {
  return message === '1' || message === '2' || message === '3'
}

function isAwaitingReply(status: string): boolean {
  return status === 'new' || status === 'waiting_reply'
}

function createReply(message: string, status = 200): NextResponse {
  return NextResponse.json({ reply: message }, { status })
}

async function parsePayload(req: NextRequest): Promise<WhatsAppPayload> {
  const payload: unknown = await req.json()

  if (!validatePayload(payload)) {
    throw new Error('Payload de webhook inválido')
  }

  return {
    From: payload.From,
    Body: normalizeMessage(payload.Body),
    MessageSid: payload.MessageSid.trim(),
  }
}

async function findOrCreateContact(phoneNumber: string): Promise<{
  contact: ContactRecord
  isNewContact: boolean
}> {
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
      status: 'waiting_reply',
      source: 'whatsapp',
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

async function findOrCreateConversation(contactId: string): Promise<{ id: string }> {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      contactId,
      status: {
        in: ['OPEN', 'PENDING'],
      },
    },
    select: { id: true },
    orderBy: { lastMessageAt: 'desc' },
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
  messageSid: string
  body: string
}): Promise<void> {
  const existingMessage = await prisma.message.findUnique({
    where: { whatsappId: params.messageSid },
    select: { id: true },
  })

  if (!existingMessage) {
    await prisma.message.create({
      data: {
        conversationId: params.conversationId,
        direction: 'INBOUND',
        type: 'TEXT',
        content: params.body,
        whatsappId: params.messageSid,
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

async function handleTriageReply(contact: ContactRecord, message: string): Promise<string> {
  if (!isMenuOption(message)) {
    if (contact.status !== 'waiting_reply') {
      await updateContactStatus(contact.id, 'waiting_reply')
    }

    return INVALID_OPTION_MESSAGE
  }

  const selection = MENU_SELECTIONS[message]

  await updateContactStatus(contact.id, selection.nextStatus)

  return selection.confirmationMessage
}

export async function POST(req: NextRequest) {
  try {
    const payload = await parsePayload(req)
    const phoneNumber = normalizePhoneNumber(payload.From)
    const { contact, isNewContact } = await findOrCreateContact(phoneNumber)
    const conversation = await findOrCreateConversation(contact.id)

    await persistIncomingMessage({
      conversationId: conversation.id,
      messageSid: payload.MessageSid,
      body: payload.Body,
    })

    if (isNewContact) {
      return createReply(WELCOME_MENU)
    }

    if (isAwaitingReply(contact.status)) {
      const reply = await handleTriageReply(contact, payload.Body)
      return createReply(reply)
    }

    return createReply(FALLBACK_MESSAGE)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Ocorreu um erro ao processar o webhook.'

    console.error('Erro ao processar webhook do WhatsApp:', message)

    const status = message === 'Payload de webhook inválido' ? 400 : 500

    return createReply(
      status === 400
        ? 'Payload inválido. Verifique os campos obrigatórios do webhook.'
        : 'Ocorreu um erro. Tente novamente mais tarde.',
      status,
    )
  }
}
