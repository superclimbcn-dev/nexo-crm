import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/whatsapp/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function createJsonResponse(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, { status })
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse(null, { status: 404 })
  }

  try {
    const rawPayload: unknown = await req.json()

    if (!WhatsAppService.validateSimpleWebhookPayload(rawPayload)) {
      return createJsonResponse(
        {
          error: 'Payload inválido. Verifique os campos obrigatórios do webhook.',
        },
        400,
      )
    }

    const result = await WhatsAppService.handleIncomingMessage(
      WhatsAppService.toNormalizedPayload(rawPayload),
    )

    return createJsonResponse({
      success: true,
      reply: result.replyMessage,
      replySent: result.replySent,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Ocorreu um erro ao processar o webhook.'

    console.error('Erro ao processar webhook do WhatsApp:', message)

    return createJsonResponse(
      {
        error: 'Ocorreu um erro. Tente novamente mais tarde.',
      },
      500,
    )
  }
}
