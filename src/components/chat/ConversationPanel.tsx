'use client'

import { useEffect, useRef } from 'react'
import {
  Bot,
  Check,
  CheckCheck,
  Image as ImageIcon,
  User,
} from 'lucide-react'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { ChatInput } from './ChatInput'

export interface ConversationPanelMessage {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  type:
    | 'TEXT'
    | 'IMAGE'
    | 'DOCUMENT'
    | 'AUDIO'
    | 'VIDEO'
    | 'TEMPLATE'
    | 'LOCATION'
    | 'CONTACT'
  content: string
  mediaUrl: string | null
  mediaType: string | null
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  createdAt: Date
  aiGenerated: boolean
}

interface ConversationPanelProps {
  contactName: string
  conversationId: string
  messages: ConversationPanelMessage[]
  onSendMessage: (formData: FormData) => Promise<void>
}

function getMessageStatusIcon(message: ConversationPanelMessage) {
  if (message.direction !== 'OUTBOUND') {
    return null
  }

  if (message.status === 'READ') {
    return <CheckCheck className="h-3 w-3 text-sky-300" />
  }

  if (message.status === 'DELIVERED') {
    return <CheckCheck className="h-3 w-3" />
  }

  return <Check className="h-3 w-3" />
}

function isImageMessage(message: ConversationPanelMessage): boolean {
  return message.type === 'IMAGE' || message.mediaType === 'image'
}

function hasRenderableMedia(message: ConversationPanelMessage): boolean {
  return typeof message.mediaUrl === 'string' && message.mediaUrl.length > 0
}

export function ConversationPanel({
  contactName,
  conversationId,
  messages,
  onSendMessage,
}: ConversationPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef.current

    if (!container) {
      return
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length])

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold">Conversación</h2>
        <p className="text-sm text-muted-foreground">
          Historial completo para revisar el contexto antes de preparar el presupuesto.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6" ref={scrollContainerRef}>
          <div className="space-y-4">
            {messages.map((message) => {
              const isOutbound = message.direction === 'OUTBOUND'

              return (
                <div
                  key={message.id}
                  className={cn('flex', isOutbound ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[78%] rounded-2xl border px-4 py-3 shadow-sm',
                      isOutbound
                        ? 'border-primary/20 bg-primary text-primary-foreground'
                        : 'border-border bg-background',
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs opacity-80">
                      {isOutbound ? (
                        <Bot className="h-3.5 w-3.5" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                      <span>{isOutbound ? 'Asesor / Sistema' : contactName}</span>
                    </div>

                    {hasRenderableMedia(message) ? (
                      <a
                        href={message.mediaUrl ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="mb-3 block overflow-hidden rounded-xl border border-black/10 bg-white/10"
                      >
                        {isImageMessage(message) ? (
                          <img
                            alt={`Imagen enviada por ${contactName}`}
                            className="max-h-80 w-full object-cover"
                            src={message.mediaUrl ?? ''}
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-4 text-sm">
                            <ImageIcon className="h-5 w-5" />
                            <span>Abrir archivo adjunto</span>
                          </div>
                        )}
                      </a>
                    ) : null}

                    {message.content ? (
                      <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                    ) : (
                      <p className="text-sm italic opacity-80">Sin texto adicional.</p>
                    )}

                    <div className="mt-3 flex items-center justify-end gap-2 text-[11px] opacity-80">
                      <span title={formatDate(message.createdAt)}>
                        {formatRelativeTime(message.createdAt)}
                      </span>
                      {getMessageStatusIcon(message)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <ChatInput conversationId={conversationId} onSendMessage={onSendMessage} />
      </div>
    </section>
  )
}
