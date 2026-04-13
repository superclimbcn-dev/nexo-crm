import crypto from 'crypto'
import { MessageStatus, MessageType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type TriageStatus =
  | 'new'
  | 'waiting_reply'
  | 'AWAITING_SERVICE_SELECTION'
  | 'AWAITING_PHOTOS'
  | 'TRIAGE_COMPLETED'
  | 'interesse_sofas_alfombras'
  | 'interesse_impermeabilizacion'
  | 'interesse_carros'

export type MenuOption = '1' | '2' | '3'

export type ServiceInterest =
  | 'sofas_alfombras'
  | 'impermeabilizacion'
  | 'carros'

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
    id?: string
    caption?: string
    link?: string
    mime_type?: string
  }
  document?: {
    id?: string
    caption?: string
    link?: string
    mime_type?: string
  }
  audio?: {
    id?: string
    link?: string
    mime_type?: string
  }
  video?: {
    id?: string
    caption?: string
    link?: string
    mime_type?: string
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
  customFields: Prisma.JsonValue | null
}

interface ConversationRecord {
  id: string
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

interface TriageDecision {
  nextStatus: TriageStatus | null
  replyMessage: string | null
  actionLabel: string
  selectedService?: ServiceInterest | null
}

interface MetaMediaLookupResponse {
  url: string
  mime_type?: string
}

interface MediaExtractionResult {
  body: string
  mediaUrl: string | null
  mediaType: string | null
}

interface ParsedTriageContext {
  selectedService: ServiceInterest | null
}

type AutomationRecord = Awaited<ReturnType<typeof fetchActiveAutomations>>[number]
type NormalizedTriageState =
  | 'waiting_reply'
  | 'AWAITING_SERVICE_SELECTION'
  | 'AWAITING_PHOTOS'
  | 'TRIAGE_COMPLETED'

const WELCOME_MENU = [
  '¡Hola! Bienvenido a Superclim.',
  'Elige una opción:',
  '1. Sofás/Alfombras',
  '2. Impermeabilización',
  '3. Carros',
].join('\n')

const INVALID_OPTION_MESSAGE = [
  'No entendí tu elección.',
  'Por favor, responde con 1, 2 o 3.',
  '',
  WELCOME_MENU,
].join('\n')

const PHOTO_REMINDER_MESSAGE =
  'Para preparar el presupuesto necesitamos fotos del servicio. Por favor, envíalas por aquí.'

const PHOTO_CONFIRMATION_MESSAGE =
  '¡Perfecto! Ya recibimos tus fotos. Un asesor de Superclim revisará el material y te responderá en breve.'

const FALLBACK_MESSAGE = 'Gracias por tu mensaje. En breve nos pondremos en contacto contigo.'

const SERVICE_CONFIRMATION_MESSAGES: Record<ServiceInterest, string> = {
  sofas_alfombras:
    '¡Perfecto! Has elegido Sofás/Alfombras. Ahora, por favor, envía fotos para que podamos evaluar el servicio.',
  impermeabilizacion:
    '¡Perfecto! Has elegido Impermeabilización. Ahora, por favor, envía fotos para que podamos evaluar el servicio.',
  carros:
    '¡Perfecto! Has elegido Carros. Ahora, por favor, envía fotos para que podamos evaluar el servicio.',
}

const SERVICE_BY_MENU_OPTION: Record<MenuOption, ServiceInterest> = {
  '1': 'sofas_alfombras',
  '2': 'impermeabilizacion',
  '3': 'carros',
}

const LEGACY_STATUS_TO_SERVICE: Record<
  Extract<
    TriageStatus,
    'interesse_sofas_alfombras' | 'interesse_impermeabilizacion' | 'interesse_carros'
  >,
  ServiceInterest
> = {
  interesse_sofas_alfombras: 'sofas_alfombras',
  interesse_impermeabilizacion: 'impermeabilizacion',
  interesse_carros: 'carros',
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

function logClientAction(params: {
  requestId: string
  phoneNumber: string
  status: string
  action: string
  messageSid: string
}): void {
  console.log(
    `CLIENTE ${params.phoneNumber} - ESTADO ACTUAL: ${params.status} - ACCIÓN: ${params.action}`,
  )

  logEvent('Triage action', {
    requestId: params.requestId,
    phoneNumber: params.phoneNumber,
    messageSid: params.messageSid,
    status: params.status,
    details: {
      action: params.action,
    },
  })
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isJsonObject(
  value: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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
      value.messages.every((message) => isObject(message) && typeof message.id === 'string'))

  return value.messaging_product === 'whatsapp' && contactsAreValid && messagesAreValid
}

function isMetaMediaLookupResponse(value: unknown): value is MetaMediaLookupResponse {
  return isObject(value) && typeof value.url === 'string'
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

async function fetchMediaUrl(mediaId: string): Promise<{
  mediaUrl: string | null
  mediaType: string | null
}> {
  const config = ensureWhatsAppConfig()
  const mediaUrl = `https://graph.facebook.com/${config.apiVersion}/${mediaId}`

  const response = await fetch(mediaUrl, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
  })

  const responseBody: unknown = await response.json()

  if (!response.ok || !isMetaMediaLookupResponse(responseBody)) {
    return {
      mediaUrl: null,
      mediaType: null,
    }
  }

  return {
    mediaUrl: responseBody.url,
    mediaType: responseBody.mime_type ?? null,
  }
}

async function extractContentFromMetaMessage(
  message: MetaIncomingMessageRecord,
): Promise<MediaExtractionResult> {
  const normalizedType = normalizeMetaMessageType(message.type)

  switch (normalizedType) {
    case 'text':
      return {
        body: normalizeMessage(message.text?.body ?? ''),
        mediaUrl: null,
        mediaType: null,
      }
    case 'image': {
      const mediaAsset = message.image?.id ? await fetchMediaUrl(message.image.id) : null

      return {
        body: normalizeMessage(message.image?.caption ?? ''),
        mediaUrl: mediaAsset?.mediaUrl ?? message.image?.link ?? null,
        mediaType: mediaAsset?.mediaType ?? message.image?.mime_type ?? 'image',
      }
    }
    case 'document':
      return {
        body: normalizeMessage(message.document?.caption ?? ''),
        mediaUrl: message.document?.link ?? null,
        mediaType: message.document?.mime_type ?? 'document',
      }
    case 'audio':
      return {
        body: '(Audio)',
        mediaUrl: message.audio?.link ?? null,
        mediaType: message.audio?.mime_type ?? 'audio',
      }
    case 'video':
      return {
        body: normalizeMessage(message.video?.caption ?? ''),
        mediaUrl: message.video?.link ?? null,
        mediaType: message.video?.mime_type ?? 'video',
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

function getParsedTriageContext(customFields: Prisma.JsonValue | null): ParsedTriageContext {
  if (!isJsonObject(customFields)) {
    return {
      selectedService: null,
    }
  }

  const selectedService = customFields.triageService

  if (
    selectedService === 'sofas_alfombras' ||
    selectedService === 'impermeabilizacion' ||
    selectedService === 'carros'
  ) {
    return {
      selectedService,
    }
  }

  return {
    selectedService: null,
  }
}

function getCustomFieldsWithTriageUpdate(params: {
  currentCustomFields: Prisma.JsonValue | null
  selectedService?: ServiceInterest | null
  triageCompletedAt?: string
}): Prisma.InputJsonValue {
  const nextCustomFields: Prisma.JsonObject = isJsonObject(params.currentCustomFields)
    ? { ...params.currentCustomFields }
    : {}

  if (params.selectedService) {
    nextCustomFields.triageService = params.selectedService
  }

  if (params.triageCompletedAt) {
    nextCustomFields.triageCompletedAt = params.triageCompletedAt
  }

  return nextCustomFields
}

function resolveCurrentTriageState(contact: ContactRecord): {
  currentStatus: NormalizedTriageState
  selectedService: ServiceInterest | null
  needsLegacyNormalization: boolean
} {
  const triageContext = getParsedTriageContext(contact.customFields)

  switch (contact.status) {
    case 'new':
    case 'waiting_reply':
      return {
        currentStatus: 'waiting_reply',
        selectedService: triageContext.selectedService,
        needsLegacyNormalization: false,
      }
    case 'AWAITING_SERVICE_SELECTION':
    case 'AWAITING_PHOTOS':
    case 'TRIAGE_COMPLETED':
      return {
        currentStatus: contact.status,
        selectedService: triageContext.selectedService,
        needsLegacyNormalization: false,
      }
    case 'interesse_sofas_alfombras':
    case 'interesse_impermeabilizacion':
    case 'interesse_carros':
      return {
        currentStatus: 'AWAITING_PHOTOS',
        selectedService: LEGACY_STATUS_TO_SERVICE[contact.status],
        needsLegacyNormalization: true,
      }
    default:
      return {
        currentStatus: 'waiting_reply',
        selectedService: triageContext.selectedService,
        needsLegacyNormalization: false,
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
      customFields: true,
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
      customFields: {
        triageService: null,
      },
    },
    select: {
      id: true,
      phoneNumber: true,
      status: true,
      customFields: true,
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

async function updateContactWorkflow(params: {
  contactId: string
  currentCustomFields: Prisma.JsonValue | null
  nextStatus: TriageStatus
  selectedService?: ServiceInterest | null
  triageCompletedAt?: string
}): Promise<void> {
  await prisma.contact.update({
    where: { id: params.contactId },
    data: {
      status: params.nextStatus,
      customFields: getCustomFieldsWithTriageUpdate({
        currentCustomFields: params.currentCustomFields,
        selectedService: params.selectedService,
        triageCompletedAt: params.triageCompletedAt,
      }),
    },
  })
}

async function decideReply(params: {
  requestId: string
  contact: ContactRecord
  payload: WhatsAppPayload
}): Promise<TriageDecision> {
  const resolvedState = resolveCurrentTriageState(params.contact)

  if (resolvedState.needsLegacyNormalization) {
    await updateContactWorkflow({
      contactId: params.contact.id,
      currentCustomFields: params.contact.customFields,
      nextStatus: 'AWAITING_PHOTOS',
      selectedService: resolvedState.selectedService,
    })
  }

  switch (resolvedState.currentStatus) {
    case 'waiting_reply':
      await updateContactWorkflow({
        contactId: params.contact.id,
        currentCustomFields: params.contact.customFields,
        nextStatus: 'AWAITING_SERVICE_SELECTION',
        selectedService: resolvedState.selectedService,
      })

      return {
        nextStatus: 'AWAITING_SERVICE_SELECTION',
        replyMessage: WELCOME_MENU,
        actionLabel: 'Menú inicial enviado',
        selectedService: resolvedState.selectedService,
      }
    case 'AWAITING_SERVICE_SELECTION':
      if (params.payload.messageType !== 'text' || !isMenuOption(params.payload.body)) {
        return {
          nextStatus: 'AWAITING_SERVICE_SELECTION',
          replyMessage: INVALID_OPTION_MESSAGE,
          actionLabel: 'Menú reenviado por opción inválida',
          selectedService: resolvedState.selectedService,
        }
      }

      const selectedService = SERVICE_BY_MENU_OPTION[params.payload.body]

      await updateContactWorkflow({
        contactId: params.contact.id,
        currentCustomFields: params.contact.customFields,
        nextStatus: 'AWAITING_PHOTOS',
        selectedService,
      })

      return {
        nextStatus: 'AWAITING_PHOTOS',
        replyMessage: SERVICE_CONFIRMATION_MESSAGES[selectedService],
        actionLabel: `Servicio ${selectedService} seleccionado y solicitud de fotos enviada`,
        selectedService,
      }
    case 'AWAITING_PHOTOS':
      if (params.payload.messageType === 'image' && params.payload.mediaUrl) {
        await updateContactWorkflow({
          contactId: params.contact.id,
          currentCustomFields: params.contact.customFields,
          nextStatus: 'TRIAGE_COMPLETED',
          selectedService: resolvedState.selectedService,
          triageCompletedAt: new Date().toISOString(),
        })

        return {
          nextStatus: 'TRIAGE_COMPLETED',
          replyMessage: PHOTO_CONFIRMATION_MESSAGE,
          actionLabel: 'Fotos recibidas y triage completado',
          selectedService: resolvedState.selectedService,
        }
      }

      return {
        nextStatus: 'AWAITING_PHOTOS',
        replyMessage: PHOTO_REMINDER_MESSAGE,
        actionLabel:
          params.payload.messageType === 'image'
            ? 'Imagen sin URL temporal, se solicitaron nuevas fotos'
            : 'Recordatorio de envío de fotos',
        selectedService: resolvedState.selectedService,
      }
    case 'TRIAGE_COMPLETED':
      return {
        nextStatus: 'TRIAGE_COMPLETED',
        replyMessage: null,
        actionLabel: 'Sin respuesta automática, triage ya completado',
        selectedService: resolvedState.selectedService,
      }
  }
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
  if (!isJsonObject(triggerConfig) || !Array.isArray(triggerConfig.keywords)) {
    return []
  }

  return triggerConfig.keywords.filter(
    (keyword): keyword is string => typeof keyword === 'string',
  )
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

  if (isNewContact) {
    logEvent('Triage state transition', {
      requestId,
      phoneNumber: contact.phoneNumber,
      messageSid: payload.messageSid,
      status: 'AWAITING_SERVICE_SELECTION',
      details: {
        oldStatus: 'waiting_reply',
        newStatus: 'AWAITING_SERVICE_SELECTION',
      },
    })
  }

  const decision = await decideReply({
    requestId,
    contact,
    payload,
  })

  logClientAction({
    requestId,
    phoneNumber: contact.phoneNumber,
    status: decision.nextStatus ?? contact.status,
    action: decision.actionLabel,
    messageSid: payload.messageSid,
  })

  if (decision.replyMessage) {
    const response = await sendWhatsAppMessage(contact.phoneNumber, decision.replyMessage, requestId)
    const outboundMessageId = response.messages?.[0]?.id

    await persistOutboundMessage({
      conversationId: conversation.id,
      message: decision.replyMessage,
      outboundMessageId,
    })
  }

  if (decision.nextStatus !== 'TRIAGE_COMPLETED') {
    await checkAutomations({
      conversation,
      contact,
      messageContent: payload.body,
    })
  }

  return {
    requestId,
    replyMessage: decision.replyMessage,
    replySent: decision.replyMessage !== null,
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

async function toNormalizedPayloadsFromMeta(
  value: MetaWhatsAppValuePayload,
): Promise<WhatsAppPayload[]> {
  const profileName = value.contacts?.[0]?.profile?.name?.trim() || null

  return Promise.all(
    (value.messages ?? []).map(async (message) => {
      const { body, mediaUrl, mediaType } = await extractContentFromMetaMessage(message)

      return {
        phoneNumber: normalizePhoneNumber(message.from),
        body,
        messageSid: message.id,
        profileName,
        messageType: normalizeMetaMessageType(message.type),
        mediaUrl,
        mediaType,
      }
    }),
  )
}

async function handleMetaWebhook(payload: MetaWhatsAppWebhookPayload): Promise<void> {
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value

      if (!value) {
        continue
      }

      for (const normalizedPayload of await toNormalizedPayloadsFromMeta(value)) {
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
