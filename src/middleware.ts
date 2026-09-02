import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/((?!api/auth|api/webhooks/whatsapp|api/whatsapp/webhook|_next/static|_next/image|favicon.ico|login).*)",
  ],
}
