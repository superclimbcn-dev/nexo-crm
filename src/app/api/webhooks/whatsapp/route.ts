import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/whatsapp/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    const rawBody = await req.text()
    const signature = req.headers.get('x-hub-signature-256')

    if (process.env.NODE_ENV === 'production') {
      const secret = process.env.WHATSAPP_WEBHOOK_SECRET || ''

      if (!WhatsAppService.verifyMetaSignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
      }
    }

    const rawPayload: unknown = JSON.parse(rawBody)

    if (!WhatsAppService.validateMetaWebhookPayload(rawPayload)) {
      return NextResponse.json(
        {
          error: 'Payload inválido. Verifique a estrutura enviada pelo provedor.',
        },
        { status: 400 },
      )
    }

    await WhatsAppService.handleMetaWebhook(rawPayload)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'

    console.error('Erro no webhook do WhatsApp:', message)

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
