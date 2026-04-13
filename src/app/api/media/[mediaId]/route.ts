import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface MediaMetadataResponse {
  url: string
  mime_type?: string
}

function getWhatsAppConfig(): { apiVersion: string; token: string } | null {
  const apiVersion = process.env.WHATSAPP_API_VERSION ?? 'v18.0'
  const token = process.env.WHATSAPP_TOKEN ?? process.env.WHATSAPP_ACCESS_TOKEN ?? ''

  if (!token) {
    return null
  }

  return {
    apiVersion,
    token,
  }
}

function isMediaMetadataResponse(value: unknown): value is MediaMetadataResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    typeof value.url === 'string'
  )
}

export async function GET(
  _request: Request,
  { params }: { params: { mediaId: string } },
): Promise<NextResponse> {
  const config = getWhatsAppConfig()

  if (!config) {
    return NextResponse.json(
      { error: 'Token de WhatsApp no configurado' },
      { status: 500 },
    )
  }

  const mediaId = params.mediaId.trim()

  if (!mediaId) {
    return NextResponse.json({ error: 'Media ID inválido' }, { status: 400 })
  }

  const metadataResponse = await fetch(
    `https://graph.facebook.com/${config.apiVersion}/${mediaId}`,
    {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
      cache: 'no-store',
    },
  )

  const metadataBody: unknown = await metadataResponse.json()

  if (!metadataResponse.ok || !isMediaMetadataResponse(metadataBody)) {
    return NextResponse.json(
      { error: 'No se pudo resolver el recurso multimedia de Meta' },
      { status: 502 },
    )
  }

  const binaryResponse = await fetch(metadataBody.url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: 'no-store',
  })

  if (!binaryResponse.ok) {
    return NextResponse.json(
      { error: 'No se pudo descargar el archivo multimedia' },
      { status: 502 },
    )
  }

  const arrayBuffer = await binaryResponse.arrayBuffer()
  const contentType = metadataBody.mime_type ?? binaryResponse.headers.get('content-type') ?? 'application/octet-stream'

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=300, stale-while-revalidate=60',
    },
  })
}
