import { prisma } from '@/lib/prisma'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

function getStartOfToday(): Date {
  const now = new Date()

  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export default async function AnalyticsPage() {
  const startOfToday = getStartOfToday()

  const [messagesToday, totalContacts] = await Promise.all([
    prisma.message.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),
    prisma.contact.count(),
  ])

  return (
    <AnalyticsDashboard
      messagesToday={messagesToday}
      totalContacts={totalContacts}
    />
  )
}
