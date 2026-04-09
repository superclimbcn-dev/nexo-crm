'use client'

import { motion } from 'framer-motion'
import { NEXUS_STATUS_CONFIG } from '@/lib/nexus/constants'
import type { NexusLead } from '@/types/nexus'

interface StatusBadgeProps {
  status: NexusLead['status']
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = NEXUS_STATUS_CONFIG[status]

  return (
    <motion.span
      whileHover={{ scale: 1.04 }}
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${config.color}`}
    >
      {config.label}
    </motion.span>
  )
}
