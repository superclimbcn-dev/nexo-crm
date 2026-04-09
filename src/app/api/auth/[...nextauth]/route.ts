import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function createAuthHandler() {
  const [{ PrismaAdapter }, { prisma }] = await Promise.all([
    import('@auth/prisma-adapter'),
    import('@/lib/prisma'),
  ])

  return NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              password: true,
            },
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        },
      }),
    ],
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role
        }
        return token
      },
      async session({ session, token }) {
        if (session.user && token) {
          session.user.role = token.role
        }
        return session
      },
    },
    pages: {
      signIn: '/login',
    },
  })
}

export async function GET(request: Request, context: unknown) {
  const handler = await createAuthHandler()
  return handler(request, context as never)
}

export async function POST(request: Request, context: unknown) {
  const handler = await createAuthHandler()
  return handler(request, context as never)
}
