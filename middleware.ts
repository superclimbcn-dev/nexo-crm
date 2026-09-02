export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/((?!login|api/auth|api/webhooks/whatsapp|api/whatsapp/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
}
