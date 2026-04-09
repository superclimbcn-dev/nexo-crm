'use client'

import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckSquare,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react'
import { AnimatedNumber } from '@/components/nexus/AnimatedNumber'
import { Sparkline } from '@/components/nexus/Sparkline'
import { NEXUS_ANIMATION } from '@/lib/nexus/constants'
import type { NexusStatCard } from '@/types/nexus'

const iconMap = {
  Users,
  TrendingUp,
  DollarSign,
  CheckSquare,
}

const colorMap = {
  indigo: { iconBg: 'bg-indigo-500/20', iconText: 'text-indigo-400', trendText: '#6366f1', border: 'group-hover:border-indigo-500/30' },
  emerald: { iconBg: 'bg-emerald-500/20', iconText: 'text-emerald-400', trendText: '#10b981', border: 'group-hover:border-emerald-500/30' },
  amber: { iconBg: 'bg-amber-500/20', iconText: 'text-amber-400', trendText: '#f59e0b', border: 'group-hover:border-amber-500/30' },
  rose: { iconBg: 'bg-rose-500/20', iconText: 'text-rose-400', trendText: '#f43f5e', border: 'group-hover:border-rose-500/30' },
} as const

interface StatsCardProps extends NexusStatCard {
  index: number
}

export function StatsCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  color,
  sparkline,
  index,
}: StatsCardProps) {
  const Icon = iconMap[icon]
  const palette = colorMap[color]
  const isPositive = trend >= 0
  const numericValue = Number.parseFloat(value.replace(/[^0-9.]/g, ''))
  const prefix = value.match(/^[^0-9]*/)?.[0] || ''
  const suffix = value.match(/[^0-9]*$/)?.[0] || ''

  const formatValue = (current: number) => {
    if (value.includes('M')) return `${prefix}${(current / 1000000).toFixed(1)}M`
    if (value.includes('%')) return `${current.toFixed(1)}%`
    return `${prefix}${Math.round(current).toLocaleString()}${suffix}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: NEXUS_ANIMATION.duration.normal, delay: 0.15 + index * NEXUS_ANIMATION.stagger.normal }}
      whileHover={{ y: -4, boxShadow: '0 14px 40px rgba(0, 0, 0, 0.35)' }}
      className={`group rounded-2xl border border-[#1c1f26] bg-[#161920] p-6 transition-colors ${palette.border}`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.iconBg}`}>
          <Icon className={`h-6 w-6 ${palette.iconText}`} />
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          <span>{isPositive ? '+' : ''}{trend}%</span>
        </div>
      </div>

      <div className="mb-3 text-4xl font-bold tracking-tight text-white">
        <AnimatedNumber value={numericValue} format={formatValue} />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#9fb0ca]">{title}</p>
          <p className="mt-2 text-xs text-[#64748b]">{trendLabel}</p>
        </div>
        <Sparkline data={sparkline} color={palette.trendText} />
      </div>
    </motion.div>
  )
}
