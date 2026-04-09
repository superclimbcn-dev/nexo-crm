'use client'

import { StatsCard } from '@/components/nexus/StatsCard'
import type { NexusStatCard } from '@/types/nexus'

interface StatsGridProps {
  stats: NexusStatCard[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={stat.title} index={index} {...stat} />
      ))}
    </div>
  )
}
