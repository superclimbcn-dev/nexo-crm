'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, Check, Moon, Search, Settings, Sun, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { NexusNotification, NexusUser } from '@/types/nexus'

interface HeaderProps {
  user: NexusUser
  notifications: NexusNotification[]
  isSidebarCollapsed: boolean
}

export function Header({ user, notifications, isSidebarCollapsed }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [unreadCount, setUnreadCount] = useState(notifications.filter((item) => !item.read).length)

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 right-0 z-40 h-16 border-b border-[#1c1f26] bg-[#0f1115]/85 backdrop-blur-xl"
      style={{ left: isSidebarCollapsed ? 80 : 260 }}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748b]">
            <span>Panel</span>
            <span>/</span>
            <span className="text-[#9fb0ca]">Vista General</span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold text-white">Vista General</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isSearchFocused ? 'text-indigo-400' : 'text-[#64748b]'}`} />
            <Input
              placeholder="Buscar leads, oportunidades..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`h-11 border-[#1c1f26] bg-[#161920] pl-10 pr-12 text-white placeholder:text-[#64748b] ${
                isSearchFocused ? 'w-80 ring-2 ring-indigo-500/20' : 'w-72'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-[#1c1f26] px-1.5 py-0.5 text-xs text-[#64748b]">
              /
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 text-[#9fb0ca] hover:bg-[#161920] hover:text-white">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-[#1c1f26] bg-[#161920] text-white">
              <div className="flex items-center justify-between border-b border-[#1c1f26] px-3 py-2">
                <span className="font-medium">Notificaciones</span>
                {unreadCount > 0 ? (
                  <button onClick={() => setUnreadCount(0)} className="text-xs text-indigo-400 hover:text-indigo-300">
                    Marcar todas como leídas
                  </button>
                ) : null}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-pointer items-start gap-3 px-3 py-3 hover:bg-[#1c1f26] focus:bg-[#1c1f26]">
                    <div className={`mt-1.5 h-2 w-2 rounded-full ${notification.read ? 'bg-[#64748b]' : 'bg-indigo-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      <p className="mt-0.5 text-xs text-[#9fb0ca]">{notification.message}</p>
                      <p className="mt-1 text-xs text-[#64748b]">{notification.timestamp}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode((current) => !current)}
            className="h-10 w-10 text-[#9fb0ca] hover:bg-[#161920] hover:text-white"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDarkMode ? (
                <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <Moon className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Sun className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-indigo-500/30">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-300">
                    {user.name.split(' ').map((part) => part[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-[#64748b]">{user.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-[#64748b]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-[#1c1f26] bg-[#161920] text-white">
              <div className="border-b border-[#1c1f26] px-3 py-2">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-[#9fb0ca]">{user.email}</p>
              </div>
              <DropdownMenuItem className="cursor-pointer hover:bg-[#1c1f26] focus:bg-[#1c1f26]">
                <Check className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-[#1c1f26] focus:bg-[#1c1f26]">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10">
                <X className="mr-2 h-4 w-4" />
                Salir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}
