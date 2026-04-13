import Link from 'next/link'
import { ArrowRight, Car, ClipboardList, Droplets, Sofa, Users } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'

type ConversionStatus =
  | 'waiting_reply'
  | 'interesse_sofas_alfombras'
  | 'interesse_impermeabilizacion'
  | 'interesse_carros'

interface StatusAggregate {
  status: ConversionStatus
  count: number
}

interface ServiceMetric {
  status: Exclude<ConversionStatus, 'waiting_reply'>
  title: string
  description: string
  count: number
  percentage: number
  icon: typeof Sofa
  accentClass: string
}

const TRACKED_STATUSES: ConversionStatus[] = [
  'waiting_reply',
  'interesse_sofas_alfombras',
  'interesse_impermeabilizacion',
  'interesse_carros',
]

function getCountByStatus(aggregates: StatusAggregate[], status: ConversionStatus): number {
  return aggregates.find((aggregate) => aggregate.status === status)?.count ?? 0
}

function getPercentage(count: number, total: number): number {
  if (total === 0) {
    return 0
  }

  return Math.round((count / total) * 100)
}

export default async function HomePage() {
  const [statusGroups, totalContacts] = await Promise.all([
    prisma.contact.groupBy({
      by: ['status'],
      where: {
        status: {
          in: TRACKED_STATUSES,
        },
      },
      _count: {
        status: true,
      },
    }),
    prisma.contact.count(),
  ])

  const aggregates: StatusAggregate[] = statusGroups
    .filter((group): group is typeof group & { status: ConversionStatus } =>
      TRACKED_STATUSES.includes(group.status as ConversionStatus),
    )
    .map((group) => ({
      status: group.status,
      count: group._count.status,
    }))

  const pendingTriage = getCountByStatus(aggregates, 'waiting_reply')
  const sofasCount = getCountByStatus(aggregates, 'interesse_sofas_alfombras')
  const impermeabilizacionCount = getCountByStatus(aggregates, 'interesse_impermeabilizacion')
  const carsCount = getCountByStatus(aggregates, 'interesse_carros')
  const qualifiedLeads = sofasCount + impermeabilizacionCount + carsCount

  const serviceMetrics: ServiceMetric[] = [
    {
      status: 'interesse_sofas_alfombras',
      title: 'Sofás y Alfombras',
      description: 'Leads que ya eligieron limpieza o tratamiento textil.',
      count: sofasCount,
      percentage: getPercentage(sofasCount, qualifiedLeads),
      icon: Sofa,
      accentClass: 'bg-amber-500',
    },
    {
      status: 'interesse_impermeabilizacion',
      title: 'Impermeabilización',
      description: 'Interesados en protección, sellado y mantenimiento.',
      count: impermeabilizacionCount,
      percentage: getPercentage(impermeabilizacionCount, qualifiedLeads),
      icon: Droplets,
      accentClass: 'bg-cyan-500',
    },
    {
      status: 'interesse_carros',
      title: 'Carros',
      description: 'Contactos que buscan limpieza o tratamiento automotriz.',
      count: carsCount,
      percentage: getPercentage(carsCount, qualifiedLeads),
      icon: Car,
      accentClass: 'bg-emerald-500',
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                Conversión en tiempo real
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">Panel de Conversión Superclim</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Visualiza cuántos leads siguen pendientes de triage y cómo se distribuyen entre
                Sofás, Impermeabilización y Carros.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/inbox"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Ver conversaciones
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contacts"
                className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Ver todos los contactos
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <Badge variant="secondary">Base total</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="mt-2 text-3xl font-bold">{totalContacts}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Contactos registrados en la base de datos.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-orange-500/10 p-3 text-orange-500">
                <ClipboardList className="h-5 w-5" />
              </div>
              <Badge variant="secondary">{getPercentage(pendingTriage, totalContacts)}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Pending Triage</p>
            <p className="mt-2 text-3xl font-bold">{pendingTriage}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Leads que aún no eligieron un servicio en WhatsApp.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
                <Users className="h-5 w-5" />
              </div>
              <Badge variant="secondary">{getPercentage(qualifiedLeads, totalContacts)}%</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Leads Cualificados</p>
            <p className="mt-2 text-3xl font-bold">{qualifiedLeads}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Contactos que ya expresaron interés en un servicio concreto.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-full bg-sky-500/10 p-3 text-sky-500">
                <Droplets className="h-5 w-5" />
              </div>
              <Badge variant="secondary">3 servicios</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Distribución Comercial</p>
            <p className="mt-2 text-3xl font-bold">{serviceMetrics.filter((item) => item.count > 0).length}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Servicios con interés registrado en la operación actual.
            </p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {serviceMetrics.map((metric) => {
            const Icon = metric.icon

            return (
              <article
                key={metric.status}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-3 text-white ${metric.accentClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold">{metric.title}</h2>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{metric.percentage}%</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Leads interesados</p>
                      <p className="text-3xl font-bold">{metric.count}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      de {qualifiedLeads} cualificados
                    </p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${metric.accentClass}`}
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </MainLayout>
  )
}
