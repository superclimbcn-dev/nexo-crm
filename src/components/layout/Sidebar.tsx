'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Inbox,
  Users,
  BarChart3,
  Megaphone,
  Bot,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

const baseNavItems: NavItem[] = [
  { label: 'Contactos', href: '/contacts', icon: Users },
  { label: 'CRM / Pipeline', href: '/crm', icon: BarChart3 },
  { label: 'Campañas', href: '/campaigns', icon: Megaphone },
  { label: 'Automatizaciones', href: '/automations', icon: Bot },
  { label: 'Plantillas', href: '/templates', icon: FileText },
  { label: 'Análisis', href: '/analytics', icon: BarChart3 },
]

const bottomNavItems: NavItem[] = [
  { label: 'Configuración', href: '/settings', icon: Settings },
  { label: 'Ayuda', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openConversationsCount, setOpenConversationsCount] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    async function loadSidebarStats() {
      try {
        const response = await fetch('/api/sidebar/stats', { cache: 'no-store' })

        if (!response.ok) {
          return
        }

        const data: unknown = await response.json()

        if (
          typeof data === 'object' &&
          data !== null &&
          'openConversationsCount' in data &&
          typeof data.openConversationsCount === 'number' &&
          isMounted
        ) {
          setOpenConversationsCount(data.openConversationsCount)
        }
      } catch (error) {
        console.error('No se pudieron cargar las estadísticas del sidebar.', error)
      }
    }

    void loadSidebarStats()

    return () => {
      isMounted = false
    }
  }, [])

  const navItems: NavItem[] = [
    {
      label: 'Bandeja de entrada',
      href: '/inbox',
      icon: Inbox,
      badge: openConversationsCount,
    },
    ...baseNavItems,
  ]

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-semibold text-lg text-white">Nexo CRM</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-secondary text-muted-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <nav className="py-4 px-2 space-y-1 border-t border-border">
        {bottomNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
