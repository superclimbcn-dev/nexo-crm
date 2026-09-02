import { prisma } from '@/lib/prisma'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export const dynamic = 'force-dynamic'

function getStartOfToday(): Date {
  const now = new Date()

  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export default async function AnalyticsPage() {
  const startOfToday = getStartOfToday()

  const [messagesToday, totalContacts, openDeals, wonDeals, pipelineDeals, sofas, waterproofing, cars, communities] = await Promise.all([
    prisma.message.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),
    prisma.contact.count(),
    prisma.deal.count({ where: { status: 'OPEN' } }),
    prisma.deal.count({ where: { status: 'WON' } }),
    prisma.deal.findMany({ where: { status: 'OPEN' }, select: { value: true } }),
    prisma.contact.count({ where: { customFields: { path: ['triageService'], equals: 'sofas_alfombras' } } }),
    prisma.contact.count({ where: { customFields: { path: ['triageService'], equals: 'impermeabilizacion' } } }),
    prisma.contact.count({ where: { customFields: { path: ['triageService'], equals: 'carros' } } }),
    prisma.contact.count({ where: { customFields: { path: ['triageService'], equals: 'comunidades' } } }),
  ])

  const pipelineValue = pipelineDeals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0)

  return (
    <AnalyticsDashboard
      messagesToday={messagesToday}
      totalContacts={totalContacts}
      openDeals={openDeals}
      wonDeals={wonDeals}
      pipelineValue={pipelineValue}
      leadsByService={[
        { label: 'Sofás y alfombras', count: sofas },
        { label: 'Impermeabilización', count: waterproofing },
        { label: 'Coches', count: cars },
        { label: 'Comunidades', count: communities },
      ]}
    />
  )
}
