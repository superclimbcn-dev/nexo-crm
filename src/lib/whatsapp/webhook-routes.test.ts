import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'
import { NextRequest } from 'next/server'
import { POST as officialWebhookPost } from '@/app/api/webhooks/whatsapp/route'
import { POST as legacyWebhookPost } from '@/app/api/whatsapp/webhook/route'
import { WhatsAppService } from './service'

test('el webhook oficial rechaza una firma inválida', async () => {
  const previousSecret = process.env.WHATSAPP_WEBHOOK_SECRET
  process.env.WHATSAPP_WEBHOOK_SECRET = 'test-signature-secret'

  try {
    const request = new NextRequest('http://localhost/api/webhooks/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ entry: [] }),
      headers: { 'x-hub-signature-256': 'sha256=invalid' },
    })

    const response = await officialWebhookPost(request)
    assert.equal(response.status, 401)
  } finally {
    process.env.WHATSAPP_WEBHOOK_SECRET = previousSecret
  }
})

test('el webhook oficial acepta un envelope vacío con firma válida', async () => {
  const previousSecret = process.env.WHATSAPP_WEBHOOK_SECRET
  const secret = 'test-signature-secret'
  const body = JSON.stringify({ entry: [] })
  const signature = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`
  process.env.WHATSAPP_WEBHOOK_SECRET = secret

  try {
    const request = new NextRequest('http://localhost/api/webhooks/whatsapp', {
      method: 'POST',
      body,
      headers: { 'x-hub-signature-256': signature },
    })

    const response = await officialWebhookPost(request)
    assert.equal(response.status, 200)
  } finally {
    process.env.WHATSAPP_WEBHOOK_SECRET = previousSecret
  }
})

test('el webhook legado no procesa ni persiste mensajes fuera de desarrollo', async () => {
  const originalHandler = WhatsAppService.handleIncomingMessage
  let handlerCalls = 0

  WhatsAppService.handleIncomingMessage = async () => {
    handlerCalls += 1
    throw new Error('El handler legado no debe ejecutarse')
  }

  try {
    const request = new NextRequest('http://localhost/api/whatsapp/webhook', {
      method: 'POST',
      body: JSON.stringify({
        From: 'TEST-NON-ROUTABLE',
        Body: 'payload que no debe crear Contact ni Message',
        MessageSid: 'TEST-NO-PERSIST',
      }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await legacyWebhookPost(request)
    assert.equal(response.status, 404)
    assert.equal(handlerCalls, 0)
  } finally {
    WhatsAppService.handleIncomingMessage = originalHandler
  }
})
