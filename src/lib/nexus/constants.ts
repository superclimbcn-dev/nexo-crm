import type { NexusNavItem } from '@/types/nexus'

export const NEXUS_ANIMATION = {
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
    page: 0.4,
  },
  easing: {
    default: [0.4, 0, 0.2, 1] as const,
    smooth: [0.25, 0.1, 0.25, 1] as const,
  },
  stagger: {
    fast: 0.05,
    normal: 0.1,
  },
}

export const NEXUS_NAV_ITEMS: NexusNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
  { id: 'leads', label: 'Leads', icon: 'Users', href: '/contacts', badge: 12 },
  { id: 'oportunidades', label: 'Oportunidades', icon: 'Target', href: '/crm' },
  { id: 'pipeline', label: 'Pipeline', icon: 'GitBranch', href: '/crm' },
  { id: 'tarefas', label: 'Tarefas', icon: 'CheckSquare', href: '/automations', badge: 5 },
  { id: 'relatorios', label: 'Relatorios', icon: 'BarChart3', href: '/analytics' },
  { id: 'configuracoes', label: 'Configuracoes', icon: 'Settings', href: '/templates' },
]

export const NEXUS_STATUS_CONFIG = {
  novo: { label: 'Novo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  em_negociacao: {
    label: 'Em Negociacao',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  convertido: { label: 'Convertido', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  perdido: { label: 'Perdido', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
} as const

export const NEXUS_SOURCE_ICONS: Record<string, string> = {
  Website: 'Globe',
  Indicacao: 'UserPlus',
  LinkedIn: 'Linkedin',
  Email: 'Mail',
  Facebook: 'Facebook',
  Instagram: 'Instagram',
  'Google Ads': 'Search',
  Evento: 'Calendar',
}
