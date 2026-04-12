import crypto from 'crypto'
import { MessageStatus, MessageType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type TriageStatus =
  | 'new'
  | 'waiting_reply'
  | 'interesse_sofas_alfombras'
  | 'interesse_impermeabilizacion'
  | 'interesse_carros'

export type MenuOption = '1' | '2' | '3'
export type SupportedMetaMessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'contacts'
  | 'unknown'

export interface WhatsAppPayload {
  phoneNumber: string
  body: string
  messageSid: string
  profileName?: string | null
  messageType: SupportedMetaMessageType
  mediaUrl?: string | null
  mediaType?: string | null
}

export interface SimpleWhatsAppWebhookPayload {
  From: string
  Body: string
  MessageSid: string
}

export interface MetaIncomingMessageRecord {
  id: string
  from: string
  type: string
  text?: {
    body?: string
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

export interface MetaIncomingStatusRecord {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp?: string
  errors?: Array<{
    message?: string
  }>
}

export interface MetaWhatsAppValuePayload {
  contacts?: Array<{
    profile?: {
      name?: string
    }
  }>
  messages?: MetaIncomingMessageRecord[]
  statuses?: MetaIncomingStatusRecord[]
}

export interface MetaWhatsAppChangePayload {
  value?: MetaWhatsAppValuePayload
}

export interface MetaWhatsAppEntryPayload {
  changes?: MetaWhatsAppChangePayload[]
}

export interface MetaWhatsAppWebhookPayload {
  entry?: MetaWhatsAppEntryPayload[]
}

interface ContactRecord {
  id: string
  phoneNumber: string
  status: string
}

interface ConversationRecord {
  id: string
}

interface ServiceSelection {
  nextStatus: Exclude<TriageStatus, 'new' | 'waiting_reply'>
  confirmationMessage: string
}

interface SendWhatsAppMessageResponse {
  messaging_product: 'whatsapp'
  contacts?: Array<{
    input: string
    wa_id: string
  }>
  messages?: Array<{
    id: string
  }>
}

interface HandleIncomingMessageResult {
  requestId: string
  replyMessage: string | null
  replySent: boolean
}

interface LogContext {
  requestId: string
  phoneNumber?: string
  messageSid?: string
  status?: string
  details?: Record<string, string | number | boolean | null | undefined>
}

type AutomationRecord = Awaited<ReturnType<typeof fetchActiveAutomations>>[number]

const WELCOME_MENU = [
  '¡Hola! Bienvenido a Superclim.',
  'Elige una opción:',
  '1. Sofás/Alfombras',
  '2. Impermeabilización',
  '3. Carros',
].join('\n')

const INVALID_OPTION_MESSAGE = 'Opción inválida. Por favor, elige 1, 2 o 3.'
const FALLBACK_MESSAGE = 'Gracias por tu mensaje. En breve nos pondremos en contacto contigo.'

const MENU_SELECTIONS: Record<MenuOption, ServiceSelection> = {
  '1': {
    nextStatus: 'interesse_sofas_alfombras',
    confirmationMessage:
      '¡Perfecto! Has elegido Sofás/Alfombras. Ahora, por favor, envía fotos para que podamos evaluar el servicio.',
  },
  '2': {
    nextStatus: 'interesse_impermeabilizacion',
    confirmationMessage:
      '¡Perfecto! Has elegido Impermeabilización. Ahora, por favor, envía fotos para que podamos evaluar el servicio.',
  },
  '3': {
    nextStatus: 'interesse_carros',
    confirmationMessage:
      '¡Perfecto! Has elegido Carros. Ahora, por favor, envía fotos para que podamos evaluar el servicio.',
  },
}

function logEvent(event: string, context: LogContext): void {
  console.log(
    JSON.stringify({
      event,
      requestId: context.requestId,
      phoneNumber: context.phoneNumber,
      messageSid: context.messageSid,
      status: context.status,
      ...context.details,
    }),
  )
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/^whatsapp:/, '').trim()
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

function isMenuOption(message: string): message is MenuOption {
  return message === '1' || message === '2' || message === '3'
}

function isAwaitingReply(status: string): boolean {
  return status === 'new' || status === 'waiting_reply'
}

function getWhatsAppConfig(): { apiVersion: string; phoneNumberId: string; token: string } | null {
  const apiVersion = process.env.WHATSAPP_API_VERSION ?? 'v18.0'
  const phoneNumberId = process.env.PHONE_NUMBER_ID ?? process.env.WHATSAPP_PHONE_NUMBER_ID ?? ''
  const token = process.env.WHATSAPP_TOKEN ?? process.env.WHATSAPP_ACCESS_TOKEN ?? ''

  if (!phoneNumberId || !token) {
    return null
  }

  return {
    apiVersion,
    phoneNumberId,
    token,
  }
}

function ensureWhatsAppConfig(): { apiVersion: string; phoneNumberId: string; token: string } {
  const config = getWhatsAppConfig()

  if (!config) {
    throw new Error(
      'Las credenciales de WhatsApp no están configuradas. Define WHATSAPP_TOKEN y PHONE_NUMBER_ID.',
    )
  }

  return config
}

function verifyMetaSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret.trim()) {
    return false
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const receivedSignature = Buffer.from(signature)
  const computedSignature = Buffer.from(`sha256=${expectedSignature}`)

  if (receivedSignature.length !== computedSignature.length) {
    return false
  }

  return crypto.timingSafeEqual(receivedSignature, computedSignature)
}

function isMetaIncomingMessageRecord(value: unknown): value is MetaIncomingMessageRecord {
  if (!isObject(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.from === 'string' &&
    typeof value.type === 'string'
  )
}

function isMetaIncomingStatusRecord(value: unknown): value is MetaIncomingStatusRecord {
  if (!isObject(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.status === 'string' &&
    ['sent', 'delivered', 'read', 'failed'].includes(value.status)
  )
}

function isSendWhatsAppMessageResponse(value: unknown): value is SendWhatsAppMessageResponse {
  if (!isObject(value)) {
    return false
  }

  const contactsAreValid =
    value.contacts === undefined ||
    (Array.isArray(value.contacts) &&
      value.contacts.every(
        (contact) =>
          isObject(contact) &&
          typeof contact.input === 'string' &&
          typeof contact.wa_id === 'string',
      ))

  const messagesAreValid =
    value.messages === undefined ||
    (Array.isArray(value.messages) &&
      value.messages.every(
        (message) => isObject(message) && typeof message.id === 'string',
      ))

  return value.messaging_product === 'whatsapp' && contactsAreValid && messagesAreValid
}

function validateSimpleWebhookPayload(payload: unknown): payload is SimpleWhatsAppWebhookPayload {
  if (!isObject(payload)) {
    return false
  }

  return (
    typeof payload.From === 'string' &&
    typeof payload.Body === 'string' &&
    typeof payload.MessageSid === 'string'
  )
}

function validateMetaWebhookPayload(payload: unknown): payload is MetaWhatsAppWebhookPayload {
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
        messages === undefined ||
        (Array.isArray(messages) && messages.every(isMetaIncomingMessageRecord))
      const statusesAreValid =
        statuses === undefined ||
        (Array.isArray(statuses) && statuses.every(isMetaIncomingStatusRecord))

      return messagesAreValid && statusesAreValid
    })
  })
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

function extractContentFromMetaMessage(message: MetaIncomingMessageRecord): {
  body: string
  mediaUrl: string | null
  mediaType: string | null
} {
  const normalizedType = normalizeMetaMessageType(message.type)

  switch (normalizedType) {
    case 'text':
      return {
        body: normalizeMessage(message.text?.body ?? ''),
        mediaUrl: null,
        mediaType: null,
      }
    case 'image':
      return {
        body: normalizeMessage(message.image?.caption ?? ''),
        mediaUrl: message.image?.link ?? null,
        mediaType: 'image',
      }
    case 'document':
      return {
        body: normalizeMessage(message.document?.caption ?? ''),
        mediaUrl: message.document?.link ?? null,
        mediaType: 'document',
      }
    case 'audio':
      return {
        body: '(Audio)',
        mediaUrl: message.audio?.link ?? null,
        mediaType: 'audio',
      }
    case 'video':
      return {
        body: normalizeMessage(message.video?.caption ?? ''),
        mediaUrl: message.video?.link ?? null,
        mediaType: 'video',
      }
    default:
      return {
        body: '(Mensaje no compatible)',
        mediaUrl: null,
        mediaType: null,
      }
  }
}

function mapStatusUpdate(status: MetaIncomingStatusRecord): {
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
      return { status: 'DELIVERED', deliveredAt: timestamp }
    case 'read':
      return { status: 'READ', readAt: timestamp }
    case 'failed':
      return {
        status: 'FAILED',
        failedAt: timestamp,
        errorMessage: status.errors?.[0]?.message,
      }
  }
}

async function findOrCreateContact(params: {
  phoneNumber: string
  profileName?: string | null
}): Promise<{ contact: ContactRecord; isNewContact: boolean }> {
  const normalizedPhoneNumber = normalizePhoneNumber(params.phoneNumber)

  const existingContact = await prisma.contact.findUnique({
    where: { phoneNumber: normalizedPhoneNumber },
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
      phoneNumber: normalizedPhoneNumber,
      name: params.profileName ?? null,
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
  payload: WhatsAppPayload
}): Promise<boolean> {
  const existingMessage = await prisma.message.findUnique({
    where: { whatsappId: params.payload.messageSid },
    select: { id: true },
  })

  if (existingMessage) {
    return false
  }

  await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      direction: 'INBOUND',
      type: mapMessageType(params.payload.messageType),
      content: params.payload.body,
      mediaUrl: params.payload.mediaUrl ?? null,
      mediaType: params.payload.mediaType ?? null,
      whatsappId: params.payload.messageSid,
      status: 'DELIVERED',
    },
  })

  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: { lastMessageAt: new Date() },
  })

  return true
}

async function persistOutboundMessage(params: {
  conversationId: string
  message: string
  outboundMessageId?: string
}): Promise<void> {
  await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      direction: 'OUTBOUND',
      type: 'TEXT',
      content: params.message,
      whatsappId: params.outboundMessageId,
      status: 'SENT',
      sentAt: new Date(),
    },
  })

  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: { lastMessageAt: new Date() },
  })
}

async function updateContactStatus(contactId: string, status: TriageStatus): Promise<void> {
  await prisma.contact.update({
    where: { id: contactId },
    data: { status },
  })
}

async function decideReply(params: {
  requestId: string
  contact: ContactRecord
  isNewContact: boolean
  payload: WhatsAppPayload
}): Promise<string | null> {
  if (params.isNewContact) {
    return WELCOME_MENU
  }

  if (params.payload.messageType !== 'text') {
    return null
  }

  if (!isAwaitingReply(params.contact.status)) {
    return FALLBACK_MESSAGE
  }

  if (!isMenuOption(params.payload.body)) {
    if (params.contact.status !== 'waiting_reply') {
      logEvent('Triage state transition', {
        requestId: params.requestId,
        phoneNumber: params.contact.phoneNumber,
        messageSid: params.payload.messageSid,
        status: 'waiting_reply',
        details: {
          oldStatus: params.contact.status,
          newStatus: 'waiting_reply',
        },
      })
      await updateContactStatus(params.contact.id, 'waiting_reply')
    }

    return INVALID_OPTION_MESSAGE
  }

  const selection = MENU_SELECTIONS[params.payload.body]
  logEvent('Triage state transition', {
    requestId: params.requestId,
    phoneNumber: params.contact.phoneNumber,
    messageSid: params.payload.messageSid,
    status: selection.nextStatus,
    details: {
      oldStatus: params.contact.status,
      newStatus: selection.nextStatus,
      selectedOption: params.payload.body,
    },
  })
  await updateContactStatus(params.contact.id, selection.nextStatus)
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
      input: { message: 'Activado' },
      output: { action: 'Ejecutado' },
      success: true,
      executedAt: new Date(),
    },
  })

  await prisma.automation.update({
    where: { id: automation.id },
    data: { executionCount: { increment: 1 } },
  })
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

async function sendWhatsAppMessage(
  to: string,
  message: string,
  requestId = crypto.randomUUID(),
): Promise<SendWhatsAppMessageResponse> {
  const config = ensureWhatsAppConfig()
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    }),
  })

  const responseBody: unknown = await response.json()
  logEvent('Meta API Response Status', {
    requestId,
    phoneNumber: to,
    status: String(response.status),
    details: {
      ok: response.ok,
    },
  })

  if (!response.ok) {
    const apiErrorMessage =
      isObject(responseBody) &&
      'error' in responseBody &&
      isObject(responseBody.error) &&
      typeof responseBody.error.message === 'string'
        ? responseBody.error.message
        : 'Error al enviar el mensaje por WhatsApp.'

    throw new Error(apiErrorMessage)
  }

  if (!isSendWhatsAppMessageResponse(responseBody)) {
    throw new Error('Respuesta inválida de la Meta Graph API.')
  }

  return responseBody
}

async function handleIncomingMessage(payload: WhatsAppPayload): Promise<HandleIncomingMessageResult> {
  const requestId = crypto.randomUUID()
  logEvent('Incoming webhook payload verified', {
    requestId,
    phoneNumber: payload.phoneNumber,
    messageSid: payload.messageSid,
    status: payload.messageType,
  })

  const { contact, isNewContact } = await findOrCreateContact({
    phoneNumber: payload.phoneNumber,
    profileName: payload.profileName,
  })
  const conversation = await findOrCreateConversation(contact.id)
  const wasPersisted = await persistIncomingMessage({
    conversationId: conversation.id,
    payload,
  })

  if (!wasPersisted) {
    return {
      requestId,
      replyMessage: null,
      replySent: false,
    }
  }

  const replyMessage = await decideReply({
    requestId,
    contact,
    isNewContact,
    payload,
  })

  if (replyMessage) {
    const response = await sendWhatsAppMessage(contact.phoneNumber, replyMessage, requestId)
    const outboundMessageId = response.messages?.[0]?.id

    await persistOutboundMessage({
      conversationId: conversation.id,
      message: replyMessage,
      outboundMessageId,
    })
  }

  await checkAutomations({
    conversation,
    contact,
    messageContent: payload.body,
  })

  return {
    requestId,
    replyMessage,
    replySent: replyMessage !== null,
  }
}

async function handleStatusUpdate(status: MetaIncomingStatusRecord): Promise<void> {
  const message = await prisma.message.findUnique({
    where: { whatsappId: status.id },
    select: { id: true },
  })

  if (!message) {
    return
  }

  await prisma.message.update({
    where: { id: message.id },
    data: mapStatusUpdate(status),
  })
}

function toNormalizedPayload(payload: SimpleWhatsAppWebhookPayload): WhatsAppPayload {
  return {
    phoneNumber: normalizePhoneNumber(payload.From),
    body: normalizeMessage(payload.Body),
    messageSid: payload.MessageSid.trim(),
    messageType: 'text',
  }
}

function toNormalizedPayloadsFromMeta(value: MetaWhatsAppValuePayload): WhatsAppPayload[] {
  const profileName = value.contacts?.[0]?.profile?.name?.trim() || null

  return (value.messages ?? []).map((message) => {
    const { body, mediaUrl, mediaType } = extractContentFromMetaMessage(message)

    return {
      phoneNumber: normalizePhoneNumber(message.from),
      body,
      messageSid: message.id,
      profileName,
      messageType: normalizeMetaMessageType(message.type),
      mediaUrl,
      mediaType,
    }
  })
}

async function handleMetaWebhook(payload: MetaWhatsAppWebhookPayload): Promise<void> {
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value

      if (!value) {
        continue
      }

      for (const normalizedPayload of toNormalizedPayloadsFromMeta(value)) {
        await handleIncomingMessage(normalizedPayload)
      }

      for (const status of value.statuses ?? []) {
        await handleStatusUpdate(status)
      }
    }
  }
}

export const WhatsAppService = {
  validateSimpleWebhookPayload,
  validateMetaWebhookPayload,
  verifyMetaSignature,
  toNormalizedPayload,
  handleIncomingMessage,
  handleMetaWebhook,
  sendWhatsAppMessage,
}

export type {
  HandleIncomingMessageResult,
  SendWhatsAppMessageResponse,
}
