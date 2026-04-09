import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role?: 'ADMIN' | 'MANAGER' | 'AGENT'
    }
  }

  interface User {
    role?: 'ADMIN' | 'MANAGER' | 'AGENT'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'ADMIN' | 'MANAGER' | 'AGENT'
  }
}
