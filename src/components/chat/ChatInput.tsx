'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { SendHorizonal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  conversationId: string
  onSendMessage: (formData: FormData) => Promise<void>
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending} type="submit">
      <SendHorizonal className="mr-2 h-4 w-4" />
      {pending ? 'Enviando...' : 'Enviar'}
    </Button>
  )
}

export function ChatInput({ conversationId, onSendMessage }: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form
      action={async (formData) => {
        await onSendMessage(formData)
        formRef.current?.reset()
      }}
      className="border-t border-border bg-card px-6 py-4"
      ref={formRef}
    >
      <input name="conversationId" type="hidden" value={conversationId} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium" htmlFor="conversation-message">
            Responder al cliente
          </label>
          <textarea
            className="min-h-[96px] w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            id="conversation-message"
            name="message"
            placeholder="Escribe una respuesta clara y profesional para el cliente..."
            required
          />
        </div>

        <div className="flex items-center justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}
