const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0'
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN

interface SendMessageOptions {
  to: string
  text?: string
  template?: {
    name: string
    language: { code: string }
    components?: any[]
  }
  mediaUrl?: string
  mediaType?: 'image' | 'document' | 'audio' | 'video'
}

interface WhatsAppResponse {
  messaging_product: string
  contacts: Array<{ input: string; wa_id: string }>
  messages: Array<{ id: string }>
}

export async function sendWhatsAppMessage(
  options: SendMessageOptions
): Promise<WhatsAppResponse> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured')
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`

  let body: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: options.to,
  }

  // Template message
  if (options.template) {
    body.type = 'template'
    body.template = options.template
  }
  // Media message
  else if (options.mediaUrl && options.mediaType) {
    body.type = options.mediaType
    body[options.mediaType] = {
      link: options.mediaUrl,
    }
    if (options.text) {
      body[options.mediaType].caption = options.text
    }
  }
  // Text message
  else if (options.text) {
    body.type = 'text'
    body.text = {
      body: options.text,
    }
  } else {
    throw new Error('Message content required')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to send message')
  }

  return response.json()
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'pt_BR',
  components?: any[]
): Promise<WhatsAppResponse> {
  return sendWhatsAppMessage({
    to,
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  })
}

export async function sendTextMessage(to: string, text: string): Promise<WhatsAppResponse> {
  return sendWhatsAppMessage({ to, text })
}

export async function sendImageMessage(
  to: string,
  imageUrl: string,
  caption?: string
): Promise<WhatsAppResponse> {
  return sendWhatsAppMessage({
    to,
    mediaUrl: imageUrl,
    mediaType: 'image',
    text: caption,
  })
}

export async function sendDocumentMessage(
  to: string,
  documentUrl: string,
  caption?: string,
  filename?: string
): Promise<WhatsAppResponse> {
  const options: SendMessageOptions = {
    to,
    mediaUrl: documentUrl,
    mediaType: 'document',
    text: caption,
  }

  if (filename) {
    ;(options as any).document = { filename }
  }

  return sendWhatsAppMessage(options)
}

// Fetch templates from Meta
export async function fetchTemplates(): Promise<any[]> {
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured')
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to fetch templates')
  }

  const data = await response.json()
  return data.data || []
}

// Upload media to WhatsApp
export async function uploadMedia(file: Buffer, mimeType: string): Promise<string> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured')
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/media`

  const formData = new FormData()
  const binaryFile = new Uint8Array(file)
  formData.append('file', new Blob([binaryFile], { type: mimeType }), 'file')
  formData.append('messaging_product', 'whatsapp')
  formData.append('type', mimeType)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to upload media')
  }

  const data = await response.json()
  return data.id
}

// Get media URL
export async function getMediaUrl(mediaId: string): Promise<string> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured')
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${mediaId}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to get media URL')
  }

  const data = await response.json()
  return data.url
}

// Mark message as read
export async function markMessageAsRead(messageId: string): Promise<void> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured')
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to mark message as read')
  }
}

// Get business profile
export async function getBusinessProfile(): Promise<any> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured')
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/whatsapp_business_profile`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to get business profile')
  }

  return response.json()
}

// Update business profile
export async function updateBusinessProfile(profile: {
  about?: string
  address?: string
  description?: string
  email?: string
  websites?: string[]
}): Promise<void> {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured')
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/whatsapp_business_profile`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      ...profile,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to update business profile')
  }
}

const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
