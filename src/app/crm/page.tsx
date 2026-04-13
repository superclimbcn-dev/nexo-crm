import Link from 'next/link'
import { DealStage, DealStatus, Prisma } from '@prisma/client'
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Filter,
  MessageSquare,
  Phone,
  Plus,
  Search,
  TrendingUp,
  UserCircle2,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

const pipelineQuery = Prisma.validator<Prisma.DealFindManyArgs>()({
  include: {
    contact: {
      select: {
        id: true,
        name: true,
        avatar: true,
        phoneNumber: true,
      },
    },
    conversation: {
      select: {
        id: true,
      },
    },
  },
  orderBy: [
    {
      updatedAt: 'desc',
    },
  ],
})

type PipelineDeal = Prisma.DealGetPayload<typeof pipelineQuery>

type PipelineStageConfig = {
  id: DealStage
  label: string
  colorClassName: string
}

type PipelineMetrics = {
  totalPipelineValue: number
  activeDeals: number
  conversionRate: number
  wonThisMonth: number
}

const visibleStages: PipelineStageConfig[] = [
  {
    id: 'NEW',
    label: 'Nuevo',
    colorClassName: 'bg-blue-500',
  },
  {
    id: 'QUALIFIED',
    label: 'Calificado',
    colorClassName: 'bg-violet-500',
  },
  {
    id: 'PROPOSAL',
    label: 'Propuesta',
    colorClassName: 'bg-amber-500',
  },
  {
    id: 'NEGOTIATION',
    label: 'Negociación',
    colorClassName: 'bg-orange-500',
  },
]

function getSearchValue(searchParams?: { q?: string }): string {
  return searchParams?.q?.trim() ?? ''
}

function getContactDisplayName(deal: PipelineDeal): string {
  return deal.contact.name?.trim() || 'Cliente sin nombre'
}

function getContactInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('') || 'SC'
}

function getDealValue(deal: PipelineDeal): number {
  return Number(deal.value ?? 0)
}

function getDealCurrency(deals: PipelineDeal[]): string {
  return deals.find((deal) => deal.currency)?.currency ?? 'BRL'
}

function isWonDeal(deal: PipelineDeal): boolean {
  return deal.status === 'WON' || deal.stage === 'CLOSED_WON'
}

function isLostDeal(deal: PipelineDeal): boolean {
  return deal.status === 'LOST' || deal.stage === 'CLOSED_LOST'
}

function getPipelineMetrics(deals: PipelineDeal[]): PipelineMetrics {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalPipelineValue = deals.reduce((sum, deal) => sum + getDealValue(deal), 0)
  const activeDeals = deals.filter((deal) => !isWonDeal(deal) && !isLostDeal(deal)).length
  const wonDeals = deals.filter(isWonDeal)
  const conversionRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0
  const wonThisMonth = wonDeals.reduce((sum, deal) => {
    const referenceDate = deal.actualClose ?? deal.updatedAt
    return referenceDate >= monthStart ? sum + getDealValue(deal) : sum
  }, 0)

  return {
    totalPipelineValue,
    activeDeals,
    conversionRate,
    wonThisMonth,
  }
}

function getStageDeals(deals: PipelineDeal[], stage: DealStage): PipelineDeal[] {
  return deals.filter((deal) => deal.stage === stage)
}

function getStageTotal(deals: PipelineDeal[], stage: DealStage): number {
  return getStageDeals(deals, stage).reduce((sum, deal) => sum + getDealValue(deal), 0)
}

function getDealLink(deal: PipelineDeal): string {
  return deal.conversation?.id
    ? `/conversations/${deal.conversation.id}`
    : `/conversations/new?contactId=${deal.contactId}`
}

function getProbabilityTone(probability: number): string {
  if (probability >= 70) {
    return 'text-emerald-500'
  }

  if (probability >= 40) {
    return 'text-amber-500'
  }

  return 'text-sky-500'
}

export default async function CRMPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const searchValue = getSearchValue(searchParams)

  const allDeals = await prisma.deal.findMany(pipelineQuery)
  const filteredDeals = searchValue
    ? allDeals.filter((deal) => {
        const normalizedSearch = searchValue.toLocaleLowerCase('es-ES')
        const dealTitle = deal.title.toLocaleLowerCase('es-ES')
        const contactName = getContactDisplayName(deal).toLocaleLowerCase('es-ES')
        const phoneNumber = deal.contact.phoneNumber
        return (
          dealTitle.includes(normalizedSearch) ||
          contactName.includes(normalizedSearch) ||
          phoneNumber.includes(searchValue)
        )
      })
    : allDeals

  const currency = getDealCurrency(allDeals)
  const metrics = getPipelineMetrics(allDeals)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pipeline de Ventas</h1>
            <p className="text-muted-foreground">
              Visualiza oportunidades reales, métricas financieras y accesos directos al cliente
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <form className="relative w-full max-w-sm lg:w-80" method="get">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                defaultValue={searchValue}
                name="q"
                placeholder="Buscar oportunidades..."
              />
            </form>
            <Button disabled variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Link href="/crm/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Oportunidad
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total en Pipeline</p>
            <p className="text-2xl font-bold">
              {formatCurrency(metrics.totalPipelineValue, currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Oportunidades activas</p>
            <p className="text-2xl font-bold">{metrics.activeDeals}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tasa de conversión</p>
            <p className="text-2xl font-bold text-blue-500">
              {metrics.conversionRate.toFixed(1).replace('.', ',')}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Ganado este mes</p>
            <p className="text-2xl font-bold text-emerald-500">
              {formatCurrency(metrics.wonThisMonth, currency)}
            </p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {visibleStages.map((stage) => {
            const stageDeals = getStageDeals(filteredDeals, stage.id)
            const stageTotal = getStageTotal(filteredDeals, stage.id)

            return (
              <section key={stage.id} className="w-80 flex-shrink-0">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.colorClassName}`} />
                    <span className="font-medium">{stage.label}</span>
                    <Badge variant="secondary">{stageDeals.length}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(stageTotal, currency)}
                  </span>
                </div>

                <div className="min-h-[420px] space-y-3 rounded-lg bg-secondary/50 p-3">
                  {stageDeals.length > 0 ? (
                    stageDeals.map((deal) => {
                      const contactName = getContactDisplayName(deal)

                      return (
                        <Link
                          key={deal.id}
                          href={getDealLink(deal)}
                          className="block rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
                        >
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-medium">{deal.title}</h3>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Haz clic para abrir la conversación o el cliente relacionado
                              </p>
                            </div>
                            <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          </div>

                          <div className="mb-3 flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={deal.contact.avatar || ''} />
                              <AvatarFallback className="bg-primary/20 text-xs text-primary">
                                {getContactInitials(contactName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{contactName}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-emerald-500">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">
                                {formatCurrency(getDealValue(deal), deal.currency)}
                              </span>
                            </div>
                            <Badge className={getProbabilityTone(deal.probability)} variant="outline">
                              {deal.probability}%
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{deal.contact.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCircle2 className="h-3.5 w-3.5" />
                              <span>
                                {deal.conversationId ? 'Conversación vinculada' : 'Sin conversación todavía'}
                              </span>
                            </div>
                            {deal.expectedClose ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  Cierre estimado:{' '}
                                  {new Date(deal.expectedClose).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            ) : null}
                            {deal.source ? (
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>Origen: {deal.source}</span>
                              </div>
                            ) : null}
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-4 text-center text-sm text-muted-foreground">
                      No hay oportunidades en esta etapa con el filtro actual.
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Resumen del cierre</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Deals ganados</p>
              <p className="mt-2 text-2xl font-bold">
                {allDeals.filter((deal) => deal.status === DealStatus.WON || deal.stage === 'CLOSED_WON').length}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Deals perdidos</p>
              <p className="mt-2 text-2xl font-bold">
                {allDeals.filter((deal) => deal.status === DealStatus.LOST || deal.stage === 'CLOSED_LOST').length}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Valor cerrado</p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(
                  allDeals
                    .filter((deal) => deal.status === DealStatus.WON || deal.stage === 'CLOSED_WON')
                    .reduce((sum, deal) => sum + getDealValue(deal), 0),
                  currency
                )}
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
