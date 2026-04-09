export interface NexusUser {
  id: string
  name: string
  email: string
  avatar: string
  role: string
}

export interface NexusLead {
  id: string
  name: string
  email: string
  avatar: string
  status: 'novo' | 'em_negociacao' | 'convertido' | 'perdido'
  source: string
  value: number
  lastContact: string
  company: string
}

export interface NexusPipelineColumn {
  id: string
  title: string
  color: string
  leads: NexusLead[]
}

export interface NexusActivity {
  id: string
  type: 'lead_created' | 'deal_won' | 'task_completed' | 'email_sent' | 'call_made'
  description: string
  timestamp: string
  user: NexusUser
}

export interface NexusStatCard {
  title: string
  value: string
  trend: number
  trendLabel: string
  icon: 'Users' | 'TrendingUp' | 'DollarSign' | 'CheckSquare'
  color: 'indigo' | 'emerald' | 'amber' | 'rose'
  sparkline: number[]
}

export interface NexusNotification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface NexusChartData {
  name: string
  value: number
  color?: string
}

export interface NexusNavItem {
  id: string
  label: string
  icon: 'LayoutDashboard' | 'Users' | 'Target' | 'GitBranch' | 'CheckSquare' | 'BarChart3' | 'Settings'
  href: string
  badge?: number
}
