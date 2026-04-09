'use client'

import { motion } from 'framer-motion'
import { CheckCircle, CheckSquare, Mail, Phone, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { NexusActivity } from '@/types/nexus'

const activityConfig = {
  lead_created: { icon: UserPlus, iconClass: 'text-blue-400', bgClass: 'bg-blue-500/20' },
  deal_won: { icon: CheckCircle, iconClass: 'text-emerald-400', bgClass: 'bg-emerald-500/20' },
  task_completed: { icon: CheckSquare, iconClass: 'text-purple-400', bgClass: 'bg-purple-500/20' },
  email_sent: { icon: Mail, iconClass: 'text-amber-400', bgClass: 'bg-amber-500/20' },
  call_made: { icon: Phone, iconClass: 'text-indigo-400', bgClass: 'bg-indigo-500/20' },
}

interface ActivityFeedProps {
  activities: NexusActivity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="h-full overflow-hidden rounded-2xl border border-[#1c1f26] bg-[#161920]"
    >
      <div className="border-b border-[#1c1f26] px-6 py-5">
        <h3 className="text-2xl font-semibold text-white">Actividad Reciente</h3>
        <p className="mt-2 text-sm text-[#9fb0ca]">Últimas acciones del equipo</p>
      </div>

      <ScrollArea className="h-[420px]">
        <div className="space-y-1 p-4">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type]
            const Icon = config.icon

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(28, 31, 38, 1)' }}
                className="flex cursor-pointer items-start gap-4 rounded-xl p-4"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.bgClass}`}>
                  <Icon className={`h-5 w-5 ${config.iconClass}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base text-white">{activity.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-[#64748b]">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="bg-indigo-500/20 text-[10px] text-indigo-300">
                        {activity.user.name.split(' ').map((part) => part[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{activity.user.name}</span>
                    <span>•</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>
    </motion.div>
  )
}
