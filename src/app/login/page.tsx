'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LockKeyhole, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const result = await signIn('credentials', { email, password, redirect: false })

    if (!result?.ok) {
      setError('El correo electrónico o la contraseña no son correctos.')
      setIsSubmitting(false)
      return
    }

    const callbackUrl = searchParams.get('callbackUrl')
    router.replace(callbackUrl?.startsWith('/') ? callbackUrl : '/')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Superclim Servicios</h1>
            <p className="text-sm text-muted-foreground">Acceso al CRM interno</p>
          </div>
        </div>

        <form className="space-y-5" method="post" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Correo electrónico</label>
            <Input autoComplete="email" id="email" name="email" required type="email" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
            <Input autoComplete="current-password" id="password" name="password" required type="password" />
          </div>
          {error ? <p className="text-sm text-red-500" role="alert">{error}</p> : null}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            <LockKeyhole className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Accediendo…' : 'Iniciar sesión'}
          </Button>
        </form>
      </section>
    </main>
  )
}
