import { WhatsAppService } from '../lib/whatsapp/service'

function maskPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length <= 4) {
    return phoneNumber
  }

  const visibleSuffix = phoneNumber.slice(-4)
  return `${'*'.repeat(Math.max(phoneNumber.length - 4, 0))}${visibleSuffix}`
}

async function main(): Promise<void> {
  const targetPhoneNumber = process.argv[2] ?? process.env.TEST_WHATSAPP_TO ?? ''

  if (!targetPhoneNumber.trim()) {
    throw new Error(
      'Informe o número de destino no argumento ou defina TEST_WHATSAPP_TO. Exemplo: node --import tsx src/scripts/test-meta-api.ts 5511999999999',
    )
  }

  const response = await WhatsAppService.sendWhatsAppMessage(targetPhoneNumber.trim(), 'Hello World')

  console.log(
    JSON.stringify({
      event: 'Meta API test message sent',
      phoneNumber: maskPhoneNumber(targetPhoneNumber.trim()),
      messageId: response.messages?.[0]?.id ?? null,
      contactWaId: response.contacts?.[0]?.wa_id ?? null,
    }),
  )
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erro desconhecido ao testar a Meta API.'
  console.error(
    JSON.stringify({
      event: 'Meta API test failed',
      error: message,
    }),
  )
  process.exit(1)
})
