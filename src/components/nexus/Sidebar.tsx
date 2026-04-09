'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Hexagon,
  LayoutDashboard,
  LogOut,
  Settings,
  Target,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { NEXUS_ANIMATION, NEXUS_NAV_ITEMS } from '@/lib/nexus/constants'
import type { NexusUser } from '@/types/nexus'

const iconMap = {
  LayoutDashboard,
  Users,
  Target,
  GitBranch,
  CheckSquare,
  BarChart3,
  Settings,
}

interface SidebarProps {
  user: NexusUser
  activeItem: string
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ user, activeItem, isCollapsed, onToggle }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ duration: NEXUS_ANIMATION.duration.slow, ease: NEXUS_ANIMATION.easing.smooth }}
        className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#1c1f26] bg-[#161920]"
      >
        <div className="flex h-16 items-center border-b border-[#1c1f26] px-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Hexagon className="h-6 w-6 text-white" />
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed ? (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-3xl font-bold text-white"
                >
                  Nexus
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#161920] bg-indigo-500 text-white transition-colors hover:bg-indigo-600"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-2">
            {NEXUS_NAV_ITEMS.map((item, index) => {
              const Icon = iconMap[item.icon]
              const isActive = item.id === activeItem

              return (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * NEXUS_ANIMATION.stagger.fast }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-lg transition-colors ${
                          isActive
                            ? 'border border-indigo-500/20 bg-indigo-500/15 text-white'
                            : 'text-[#9fb0ca] hover:bg-[#1c1f26] hover:text-white'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      >
                        <Icon className="h-6 w-6 shrink-0" />
                        <AnimatePresence initial={false}>
                          {!isCollapsed ? (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              className="flex-1 overflow-hidden whitespace-nowrap text-lg font-medium"
                            >
                              {item.label}
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                        {!isCollapsed && item.badge ? (
                          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-sm text-indigo-300">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed ? <TooltipContent side="right">{item.label}</TooltipContent> : null}
                  </Tooltip>
                </motion.li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-[#1c1f26] p-4">
          <div className={`flex items-center gap-3 rounded-2xl bg-[#1c1f26] p-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-11 w-11 border-2 border-indigo-500/30">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-indigo-500/20 text-indigo-300">
                {user.name.split(' ').map((part) => part[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence initial={false}>
              {!isCollapsed ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="min-w-0 flex-1 overflow-hidden"
                >
                  <p className="truncate text-lg font-medium text-white">{user.name}</p>
                  <p className="truncate text-sm text-[#64748b]">{user.email}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {!isCollapsed ? (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748b] hover:bg-[#161920] hover:text-white">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
