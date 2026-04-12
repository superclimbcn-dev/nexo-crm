import Link from 'next/link'
import { CampaignMessageStatus, CampaignStatus } from '@prisma/client'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Play,
  Pause,
  BarChart3,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Tag as TagIcon,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

type CampaignSearchParams = {
  tag?: string
}

type CampaignViewModel = {
  id: string
  name: string
  status: CampaignStatus
  templateName: string
  audienceCount: number
  scheduledAt: string | null
  stats: {
    sent: number
    delivered: number
    read: number
    failed: number
  }
}

const statusConfig: Record<
  CampaignStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-500', icon: Clock },
  SCHEDULED: { label: 'Programada', color: 'bg-blue-500', icon: Calendar },
  RUNNING: { label: 'Enviando', color: 'bg-yellow-500', icon: Play },
  PAUSED: { label: 'Pausada', color: 'bg-orange-500', icon: Pause },
  COMPLETED: { label: 'Completada', color: 'bg-green-500', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500', icon: XCircle },
}

function mapCampaign(campaign: {
  id: string
  name: string
  status: CampaignStatus
  templateName: string
  audienceCount: number
  scheduledAt: Date | null
  messages: Array<{ status: CampaignMessageStatus }>
}): CampaignViewModel {
  const stats = campaign.messages.reduce(
    (accumulator, message) => {
      if (message.status === 'SENT') {
        accumulator.sent += 1
      }

      if (message.status === 'DELIVERED') {
        accumulator.delivered += 1
      }

      if (message.status === 'READ') {
        accumulator.read += 1
      }

      if (message.status === 'FAILED') {
        accumulator.failed += 1
      }

      return accumulator
    },
    {
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    },
  )

  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    templateName: campaign.templateName,
    audienceCount: campaign.audienceCount,
    scheduledAt: campaign.scheduledAt ? campaign.scheduledAt.toISOString() : null,
    stats,
  }
}

function getProgressPercentage(campaign: CampaignViewModel): number {
  if (campaign.audienceCount === 0) {
    return 0
  }

  return Math.round((campaign.stats.sent / campaign.audienceCount) * 100)
}

function getRate(numerator: number, denominator: number): string {
  if (denominator === 0) {
    return '0%'
  }

  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams?: CampaignSearchParams
}) {
  const selectedTagId = searchParams?.tag?.trim() ?? ''

  const [tags, filteredAudienceCount, campaignRecords] = await Promise.all([
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            contacts: true,
          },
        },
      },
    }),
    prisma.contact.count({
      where: selectedTagId
        ? {
            tags: {
              some: {
                id: selectedTagId,
              },
            },
          }
        : undefined,
    }),
    prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        templateName: true,
        audienceCount: true,
        scheduledAt: true,
        messages: {
          select: {
            status: true,
          },
        },
      },
    }),
  ])

  const campaigns = campaignRecords.map(mapCampaign)
  const activeCampaignsCount = campaigns.filter((campaign) => campaign.status === 'RUNNING').length
  const sentThisMonth = campaigns.reduce((sum, campaign) => sum + campaign.stats.sent, 0)
  const totalDelivered = campaigns.reduce((sum, campaign) => sum + campaign.stats.delivered, 0)
  const totalRead = campaigns.reduce((sum, campaign) => sum + campaign.stats.read, 0)
  const totalFailed = campaigns.reduce((sum, campaign) => sum + campaign.stats.failed, 0)
  const deliveryBase = totalDelivered + totalRead + totalFailed
  const readBase = totalDelivered + totalRead
  const selectedTag = tags.find((tag) => tag.id === selectedTagId) ?? null

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Campañas</h1>
            <p className="text-muted-foreground">
              Envía mensajes masivos a tus contactos usando campañas reales y segmentación por tags.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Campaña
            </Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
              <MessageSquare className="mr-2 h-4 w-4" />
              Promoción de Impermeabilização
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Campañas activas</p>
            <p className="text-2xl font-bold">{activeCampaignsCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total enviado</p>
            <p className="text-2xl font-bold">{sentThisMonth.toLocaleString('es-ES')}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tasa de entrega</p>
            <p className="text-2xl font-bold text-emerald-500">
              {getRate(totalDelivered + totalRead, deliveryBase)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tasa de lectura</p>
            <p className="text-2xl font-bold text-blue-500">{getRate(totalRead, readBase)}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Filtro por Tag</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              className={cn(
                'inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                !selectedTagId
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-secondary',
              )}
              href="/campaigns"
            >
              Todas las tags
            </Link>

            {tags.map((tag) => {
              const isSelected = tag.id === selectedTagId

              return (
                <Link
                  key={tag.id}
                  className={cn(
                    'inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-secondary',
                  )}
                  href={`/campaigns?tag=${tag.id}`}
                >
                  <span
                    aria-hidden="true"
                    className="mr-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name} ({tag._count.contacts})
                </Link>
              )
            })}
          </div>

          <div className="mt-4 rounded-md bg-secondary/40 p-4 text-sm text-muted-foreground">
            {selectedTag ? (
              <span>
                Segmento ativo: <strong className="text-foreground">{selectedTag.name}</strong> com{' '}
                <strong className="text-foreground">{filteredAudienceCount}</strong> contatos prontos
                para mensagem em massa.
              </span>
            ) : (
              <span>
                Sem filtro aplicado. A audiência total disponível para campanhas é de{' '}
                <strong className="text-foreground">{filteredAudienceCount}</strong> contatos.
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const config = statusConfig[campaign.status]
            const StatusIcon = config.icon

            return (
              <div
                key={campaign.id}
                className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <Badge className={`${config.color} text-white`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Plantilla: {campaign.templateName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {campaign.audienceCount.toLocaleString('es-ES')} contactos
                      </div>
                      {campaign.scheduledAt ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(campaign.scheduledAt)}
                        </div>
                      ) : null}
                    </div>

                    {campaign.status !== 'DRAFT' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progreso</span>
                          <span>{getProgressPercentage(campaign)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${getProgressPercentage(campaign)}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="text-emerald-500">
                            <CheckCircle className="mr-1 inline h-3 w-3" />
                            Enviadas: {campaign.stats.sent}
                          </span>
                          <span className="text-blue-500">
                            <MessageSquare className="mr-1 inline h-3 w-3" />
                            Leídas: {campaign.stats.read}
                          </span>
                          <span className="text-red-500">
                            <XCircle className="mr-1 inline h-3 w-3" />
                            Fallos: {campaign.stats.failed}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {campaign.status === 'RUNNING' ? (
                      <Button size="sm" variant="outline">
                        <Pause className="mr-2 h-4 w-4" />
                        Pausar
                      </Button>
                    ) : null}
                    {campaign.status === 'PAUSED' ? (
                      <Button size="sm" variant="outline">
                        <Play className="mr-2 h-4 w-4" />
                        Reanudar
                      </Button>
                    ) : null}
                    <Button size="icon" variant="ghost">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          {campaigns.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              No hay campañas registradas todavía.
            </div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  )
}
