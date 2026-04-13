import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { Bot, Camera, ChevronRight, Inbox, MessageSquare, Phone } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'

const inboxQuery = Prisma.validator<Prisma.ConversationFindManyArgs>()({
  orderBy: {
    lastMessageAt: 'desc',
  },
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
        createdAt: 'desc',
      },
      select: {
        id: true,
        direction: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        type: true,
        createdAt: true,
        status: true,
        aiGenerated: true,
      },
    },
  },
})

type InboxConversation = Prisma.ConversationGetPayload<typeof inboxQuery>

function getContactName(conversation: InboxConversation): string {
  return conversation.contact.name?.trim() || 'Cliente sin nombre'
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean)

  if (parts.length === 0) {
    return 'SC'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getContactStatusLabel(status: string): string {
  switch (status) {
    case 'waiting_reply':
      return 'Pendiente de triage'
    case 'interesse_sofas_alfombras':
      return 'Sofás y Alfombras'
    case 'interesse_impermeabilizacion':
      return 'Impermeabilización'
    case 'interesse_carros':
      return 'Carros'
    case 'new':
      return 'Nuevo'
    default:
      return status
  }
}

function getPreviewText(conversation: InboxConversation): string {
  const lastMessage = conversation.messages[0]

  if (!lastMessage) {
    return 'Sin mensajes todavía.'
  }

  if (lastMessage.content.trim()) {
    return lastMessage.content
  }

  if (lastMessage.type === 'IMAGE' || lastMessage.mediaType === 'image') {
    return 'Imagen enviada'
  }

  if (lastMessage.mediaUrl) {
    return 'Archivo adjunto enviado'
  }

  return 'Mensaje sin contenido de texto'
}

function hasNewPhoto(conversation: InboxConversation): boolean {
  const lastMessage = conversation.messages[0]

  if (!lastMessage) {
    return false
  }

  return Boolean(lastMessage.mediaUrl) && (lastMessage.type === 'IMAGE' || lastMessage.mediaType === 'image')
}

function getMediaCount(conversation: InboxConversation): number {
  return conversation.messages.filter((message) => Boolean(message.mediaUrl)).length
}

function isPendingReview(conversation: InboxConversation): boolean {
  const lastMessage = conversation.messages[0]

  if (!lastMessage) {
    return false
  }

  return lastMessage.direction === 'INBOUND'
}

export default async function InboxPage() {
  const conversations = await prisma.conversation.findMany(inboxQuery)

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                Operación de WhatsApp
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">Bandeja de Entrada</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Revisa conversaciones reales, detecta nuevas fotos para presupuesto y entra
                directamente a la vista detallada de cada cliente.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Volver al Dashboard
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Conversaciones activas</p>
            <p className="mt-2 text-3xl font-bold">{conversations.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Pendientes de revisión</p>
            <p className="mt-2 text-3xl font-bold">
              {conversations.filter(isPendingReview).length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Conversaciones con fotos</p>
            <p className="mt-2 text-3xl font-bold">
              {conversations.filter((conversation) => getMediaCount(conversation) > 0).length}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">Chats recientes</h2>
            <p className="text-sm text-muted-foreground">
              Cada item abre la conversación completa con historial y galería de fotos.
            </p>
          </div>

          <div className="divide-y divide-border">
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                const contactName = getContactName(conversation)
                const latestMessage = conversation.messages[0] ?? null
                const mediaCount = getMediaCount(conversation)

                return (
                  <Link
                    key={conversation.id}
                    href={`/conversations/${conversation.id}`}
                    className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-secondary/40 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.contact.avatar || ''} />
                        <AvatarFallback className="bg-primary/15 text-primary">
                          {getInitials(contactName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold">{contactName}</h3>
                          <Badge variant="outline">
                            {getContactStatusLabel(conversation.contact.status)}
                          </Badge>
                          {isPendingReview(conversation) ? (
                            <Badge variant="secondary">Nuevo</Badge>
                          ) : null}
                          {hasNewPhoto(conversation) ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                              Nueva foto
                            </Badge>
                          ) : null}
                          {mediaCount > 0 ? (
                            <Badge variant="secondary">Fotos: {mediaCount}</Badge>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {conversation.contact.phoneNumber}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {conversation.messages.length} mensajes
                          </span>
                          {conversation.aiEnabled ? (
                            <span className="inline-flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              IA activa
                            </span>
                          ) : null}
                        </div>

                        <p className="truncate text-sm text-muted-foreground">
                          {getPreviewText(conversation)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pl-16 lg:pl-0">
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{formatRelativeTime(conversation.lastMessageAt)}</p>
                        {latestMessage ? (
                          <p className="text-xs">
                            {latestMessage.direction === 'INBOUND' ? 'Cliente' : 'Sistema / Bot'}
                          </p>
                        ) : null}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Sin conversaciones todavía</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Cuando lleguen mensajes desde WhatsApp, aparecerán aquí para entrar al detalle y
                  revisar la galería de fotos del cliente.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
