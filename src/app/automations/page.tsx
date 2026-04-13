import Link from 'next/link'
import { Prisma, TriggerType } from '@prisma/client'
import {
  Bot,
  Clock,
  Edit,
  ExternalLink,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Search,
  TrendingUp,
  Webhook,
  Zap,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'
import { toggleAutomationAction } from './actions'

const automationsQuery = Prisma.validator<Prisma.AutomationFindManyArgs>()({
  include: {
    _count: {
      select: {
        logs: true,
      },
    },
    logs: {
      orderBy: {
        executedAt: 'desc',
      },
      take: 1,
      select: {
        id: true,
        executedAt: true,
        success: true,
      },
    },
  },
  orderBy: {
    updatedAt: 'desc',
  },
})

const automationLogsQuery = Prisma.validator<Prisma.AutomationLogFindManyArgs>()({
  take: 8,
  orderBy: {
    executedAt: 'desc',
  },
  include: {
    automation: {
      select: {
        id: true,
        name: true,
        triggerType: true,
      },
    },
  },
})

type AutomationListItem = Prisma.AutomationGetPayload<typeof automationsQuery>
type AutomationLogItem = Prisma.AutomationLogGetPayload<typeof automationLogsQuery>

type KeywordAutomationConfig = {
  type: 'KEYWORD'
  keywords: string[]
}

type NewConversationAutomationConfig = {
  type: 'NEW_CONVERSATION'
}

type InactivityAutomationConfig = {
  type: 'INACTIVITY'
  delayMinutes: number | null
}

type ScheduleAutomationConfig = {
  type: 'SCHEDULE'
  cron: string | null
}

type WebhookAutomationConfig = {
  type: 'WEBHOOK'
  endpoint: string | null
}

type AutomationConfig =
  | KeywordAutomationConfig
  | NewConversationAutomationConfig
  | InactivityAutomationConfig
  | ScheduleAutomationConfig
  | WebhookAutomationConfig

type TriggerMetadata = {
  label: string
  colorClassName: string
  icon: typeof MessageSquare
}

const triggerMetadata: Record<TriggerType, TriggerMetadata> = {
  KEYWORD: {
    label: 'Palabra clave',
    colorClassName: 'bg-blue-500',
    icon: MessageSquare,
  },
  NEW_CONVERSATION: {
    label: 'Nuevo contacto',
    colorClassName: 'bg-green-500',
    icon: Zap,
  },
  INACTIVITY: {
    label: 'Inactividad',
    colorClassName: 'bg-orange-500',
    icon: Clock,
  },
  SCHEDULE: {
    label: 'Programado',
    colorClassName: 'bg-purple-500',
    icon: TrendingUp,
  },
  WEBHOOK: {
    label: 'Webhook',
    colorClassName: 'bg-cyan-500',
    icon: Webhook,
  },
}

function isJsonObject(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getStringArray(value: Prisma.JsonValue | undefined): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function getStringValue(value: Prisma.JsonValue | undefined): string | null {
  return typeof value === 'string' ? value : null
}

function getNumberValue(value: Prisma.JsonValue | undefined): number | null {
  return typeof value === 'number' ? value : null
}

function parseAutomationConfig(
  triggerType: TriggerType,
  triggerConfig: Prisma.JsonValue
): AutomationConfig {
  const config = isJsonObject(triggerConfig) ? triggerConfig : {}

  switch (triggerType) {
    case 'KEYWORD':
      return {
        type: 'KEYWORD',
        keywords: getStringArray(config.keywords),
      }
    case 'INACTIVITY':
      return {
        type: 'INACTIVITY',
        delayMinutes: getNumberValue(config.delay) ?? getNumberValue(config.delayMinutes),
      }
    case 'SCHEDULE':
      return {
        type: 'SCHEDULE',
        cron: getStringValue(config.cron),
      }
    case 'WEBHOOK':
      return {
        type: 'WEBHOOK',
        endpoint: getStringValue(config.endpoint),
      }
    case 'NEW_CONVERSATION':
    default:
      return {
        type: 'NEW_CONVERSATION',
      }
  }
}

function getAutomationDescription(config: AutomationConfig): string {
  switch (config.type) {
    case 'KEYWORD':
      return config.keywords.length > 0
        ? `Palabras clave: ${config.keywords.join(', ')}`
        : 'Sin palabras clave configuradas'
    case 'INACTIVITY':
      return config.delayMinutes
        ? `Dispara después de ${config.delayMinutes} minutos de inactividad`
        : 'Sin demora de inactividad definida'
    case 'SCHEDULE':
      return config.cron ? `Cron: ${config.cron}` : 'Sin expresión cron configurada'
    case 'WEBHOOK':
      return config.endpoint ? `Endpoint: ${config.endpoint}` : 'Sin endpoint configurado'
    case 'NEW_CONVERSATION':
    default:
      return 'Se ejecuta cuando llega un nuevo contacto'
  }
}

function getLogSummary(log: AutomationLogItem): string {
  if (!log.success && log.errorMessage) {
    return log.errorMessage
  }

  if (typeof log.output === 'string' && log.output.trim()) {
    return log.output
  }

  if (isJsonObject(log.output)) {
    const message = getStringValue(log.output.message)
    if (message) {
      return message
    }

    const response = getStringValue(log.output.response)
    if (response) {
      return response
    }
  }

  if (typeof log.input === 'string' && log.input.trim()) {
    return log.input
  }

  if (isJsonObject(log.input)) {
    const body = getStringValue(log.input.body)
    if (body) {
      return body
    }

    const text = getStringValue(log.input.text)
    if (text) {
      return text
    }
  }

  return log.success ? 'Ejecución completada correctamente' : 'Ejecución con error'
}

function getSearchValue(searchParams?: { q?: string }): string {
  return searchParams?.q?.trim() ?? ''
}

export default async function AutomationsPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const searchValue = getSearchValue(searchParams)
  const startOfToday = new Date()

  startOfToday.setHours(0, 0, 0, 0)

  const [automations, recentLogs, executionsToday] = await Promise.all([
    prisma.automation.findMany({
      ...automationsQuery,
      where: searchValue
        ? {
            name: {
              contains: searchValue,
              mode: 'insensitive',
            },
          }
        : undefined,
    }),
    prisma.automationLog.findMany(automationLogsQuery),
    prisma.automationLog.count({
      where: {
        executedAt: {
          gte: startOfToday,
        },
      },
    }),
  ])

  const activeAutomations = automations.filter((automation) => automation.isActive).length
  const totalExecutions = automations.reduce(
    (sum, automation) => sum + automation._count.logs,
    0
  )
  const successfulLogs = recentLogs.filter((log) => log.success).length
  const successRate = recentLogs.length > 0 ? (successfulLogs / recentLogs.length) * 100 : 100

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Automatizaciones</h1>
            <p className="text-muted-foreground">
              Gestiona respuestas automáticas y revisa ejecuciones reales del bot
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/automations/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Automatización
              </Button>
            </Link>
            <Link href="#logs">
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver ejecuciones
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Automatizaciones activas</p>
            <p className="text-2xl font-bold text-emerald-500">{activeAutomations}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total de ejecuciones</p>
            <p className="text-2xl font-bold">{totalExecutions.toLocaleString('es-ES')}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Ejecuciones hoy</p>
            <p className="text-2xl font-bold text-blue-500">{executionsToday}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tasa de éxito reciente</p>
            <p className="text-2xl font-bold text-purple-500">
              {successRate.toFixed(1).replace('.', ',')}%
            </p>
          </div>
        </div>

        <form className="relative max-w-md" method="get">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            defaultValue={searchValue}
            name="q"
            placeholder="Buscar automatizaciones..."
          />
        </form>

        <div className="space-y-4">
          {automations.length > 0 ? (
            automations.map((automation) => {
              const trigger = triggerMetadata[automation.triggerType]
              const TriggerIcon = trigger.icon
              const config = parseAutomationConfig(
                automation.triggerType,
                automation.triggerConfig
              )
              const latestExecution = automation.logs[0] ?? null

              return (
                <div
                  key={automation.id}
                  className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold">{automation.name}</h3>
                        <Badge className={`${trigger.colorClassName} text-white`}>
                          <TriggerIcon className="mr-1 h-3 w-3" />
                          {trigger.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={automation.isActive ? 'text-emerald-500' : 'text-gray-500'}
                        >
                          {automation.isActive ? 'Activa' : 'Pausada'}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          {automation._count.logs.toLocaleString('es-ES')} ejecuciones reales
                        </div>
                        <div>
                          Creada: {new Date(automation.createdAt).toLocaleDateString('es-ES')}
                        </div>
                        <div>
                          Última actualización:{' '}
                          {new Date(automation.updatedAt).toLocaleDateString('es-ES')}
                        </div>
                        {latestExecution ? (
                          <div>
                            Última ejecución: {formatRelativeTime(latestExecution.executedAt)}
                          </div>
                        ) : (
                          <div>Sin ejecuciones todavía</div>
                        )}
                      </div>

                      <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                        <p className="text-sm text-muted-foreground">
                          {getAutomationDescription(config)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <form action={toggleAutomationAction}>
                        <input name="automationId" type="hidden" value={automation.id} />
                        <input
                          name="nextIsActive"
                          type="hidden"
                          value={String(!automation.isActive)}
                        />
                        <Button size="sm" type="submit" variant="outline">
                          {automation.isActive ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </Button>
                      </form>

                      <Button disabled size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
              <h2 className="text-lg font-semibold">Sin automatizaciones</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Todavía no hay automatizaciones creadas en la base de datos o la búsqueda no
                devolvió resultados.
              </p>
            </div>
          )}
        </div>

        <section
          id="logs"
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold">Ejecutado por el bot</h2>
            <p className="text-sm text-muted-foreground">
              Registro real de cuándo respondió una automatización y cuál fue el resultado.
            </p>
          </div>

          <div className="divide-y divide-border">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => {
                const trigger = triggerMetadata[log.automation.triggerType]
                const TriggerIcon = trigger.icon

                return (
                  <div
                    key={log.id}
                    className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-start lg:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{log.automation.name}</p>
                        <Badge className={`${trigger.colorClassName} text-white`}>
                          <TriggerIcon className="mr-1 h-3 w-3" />
                          {trigger.label}
                        </Badge>
                        <Badge variant={log.success ? 'secondary' : 'destructive'}>
                          {log.success ? 'Éxito' : 'Error'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{getLogSummary(log)}</p>
                    </div>

                    <div className="text-sm text-muted-foreground lg:text-right">
                      <p>{new Date(log.executedAt).toLocaleString('es-ES')}</p>
                      {log.contactId ? <p>Contacto: {log.contactId}</p> : null}
                      {log.conversationId ? <p>Conversación: {log.conversationId}</p> : null}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <h3 className="text-base font-semibold">Sin ejecuciones registradas</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cuando una automatización responda a un cliente, el historial aparecerá aquí.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
