import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Prisma } from '@prisma/client'
import {
  ArrowLeft,
  Bot,
  Camera,
  Check,
  CheckCheck,
  Image as ImageIcon,
  MessageSquare,
  Phone,
  User,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

const conversationInclude = Prisma.validator<Prisma.ConversationDefaultArgs>()({
  include: {
    contact: {
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        avatar: true,
        status: true,
      },
    },
    messages: {
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        direction: true,
        type: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        status: true,
        createdAt: true,
        aiGenerated: true,
      },
    },
  },
})

type ConversationDetail = Prisma.ConversationGetPayload<typeof conversationInclude>
type MessageItem = ConversationDetail['messages'][number]

function getContactDisplayName(conversation: ConversationDetail): string {
  return conversation.contact.name?.trim() || 'Cliente sin nombre'
}

function getContactInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean)

  if (parts.length === 0) {
    return 'SC'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getConversationStatusLabel(status: string): string {
  switch (status) {
    case 'waiting_reply':
      return 'Pendiente de triage'
    case 'interesse_sofas_alfombras':
      return 'Interés en Sofás y Alfombras'
    case 'interesse_impermeabilizacion':
      return 'Interés en Impermeabilización'
    case 'interesse_carros':
      return 'Interés en Carros'
    case 'new':
      return 'Nuevo'
    default:
      return status
  }
}

function getMessageStatusIcon(message: MessageItem) {
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

function isImageMessage(message: MessageItem): boolean {
  return message.type === 'IMAGE' || message.mediaType === 'image'
}

function hasRenderableMedia(message: MessageItem): boolean {
  return typeof message.mediaUrl === 'string' && message.mediaUrl.length > 0
}

function getMediaMessages(messages: MessageItem[]): MessageItem[] {
  return messages.filter((message) => hasRenderableMedia(message))
}

async function getConversation(conversationId: string): Promise<ConversationDetail | null> {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    ...conversationInclude,
  })
}

export default async function ConversationPage({
  params,
}: {
  params: { id: string }
}) {
  const conversation = await getConversation(params.id)

  if (!conversation) {
    notFound()
  }

  const contactName = getContactDisplayName(conversation)
  const mediaMessages = getMediaMessages(conversation.messages)

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-7rem)] flex-col gap-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={conversation.contact.avatar || ''} />
                <AvatarFallback className="bg-primary/15 text-primary">
                  {getContactInitials(contactName)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{contactName}</h1>
                  <Badge variant="outline">{getConversationStatusLabel(conversation.contact.status)}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {conversation.contact.phoneNumber}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {conversation.messages.length} mensajes
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    {mediaMessages.length} archivos multimedia
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </div>
        </section>

        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Conversación</h2>
              <p className="text-sm text-muted-foreground">
                Historial completo para revisar el contexto antes de preparar el presupuesto.
              </p>
            </div>

            <ScrollArea className="h-[calc(100vh-20rem)] px-6 py-6">
              <div className="space-y-4">
                {conversation.messages.map((message) => {
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
                          <span>{isOutbound ? 'Sistema / Bot' : contactName}</span>
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
            </ScrollArea>
          </section>

          <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Galería de Fotos</h2>
              <p className="text-sm text-muted-foreground">
                Vista rápida de imágenes y archivos enviados por el cliente.
              </p>
            </div>

            <ScrollArea className="h-[calc(100vh-20rem)] px-6 py-6">
              {mediaMessages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {mediaMessages.map((message) => (
                    <a
                      key={message.id}
                      href={message.mediaUrl ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-primary/50"
                    >
                      {isImageMessage(message) ? (
                        <img
                          alt={`Adjunto de ${contactName}`}
                          className="h-32 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                          src={message.mediaUrl ?? ''}
                        />
                      ) : (
                        <div className="flex h-32 items-center justify-center bg-secondary/40">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="space-y-1 p-3">
                        <p className="text-xs font-medium">
                          {message.direction === 'INBOUND' ? 'Cliente' : 'Sistema / Bot'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
                  <Camera className="mb-3 h-10 w-10 text-muted-foreground" />
                  <h3 className="font-medium">Sin fotos todavía</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cuando el cliente envíe imágenes por WhatsApp, aparecerán aquí para apoyar el
                    presupuesto.
                  </p>
                </div>
              )}
            </ScrollArea>
          </aside>
        </div>
      </div>
    </MainLayout>
  )
}
