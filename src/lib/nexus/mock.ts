import type {
  NexusActivity,
  NexusChartData,
  NexusLead,
  NexusNotification,
  NexusPipelineColumn,
  NexusStatCard,
  NexusUser,
} from '@/types/nexus'

export const currentUser: NexusUser = {
  id: '1',
  name: 'Carlos Silva',
  email: 'carlos@empresa.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  role: 'Gerente de Vendas',
}

export const statsData: NexusStatCard[] = [
  {
    title: 'Total de Leads',
    value: '2847',
    trend: 12.5,
    trendLabel: 'vs mes anterior',
    icon: 'Users',
    color: 'indigo',
    sparkline: [2100, 2300, 2250, 2400, 2600, 2847],
  },
  {
    title: 'Taxa de Conversao',
    value: '24.8%',
    trend: 3.2,
    trendLabel: 'vs mes anterior',
    icon: 'TrendingUp',
    color: 'emerald',
    sparkline: [18, 21, 19, 22, 23, 24.8],
  },
  {
    title: 'Valor em Pipeline',
    value: 'R$ 1.2M',
    trend: 8.7,
    trendLabel: 'vs mes anterior',
    icon: 'DollarSign',
    color: 'amber',
    sparkline: [850000, 920000, 980000, 1050000, 1150000, 1200000],
  },
  {
    title: 'Tarefas Pendentes',
    value: '18',
    trend: -5,
    trendLabel: 'vs semana anterior',
    icon: 'CheckSquare',
    color: 'rose',
    sparkline: [28, 25, 23, 22, 20, 18],
  },
]

export const leadsData: NexusLead[] = [
  {
    id: '1',
    name: 'Ana Paula Mendes',
    email: 'ana@techcorp.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    status: 'em_negociacao',
    source: 'Website',
    value: 45000,
    lastContact: '2 horas atras',
    company: 'TechCorp',
  },
  {
    id: '2',
    name: 'Bruno Costa',
    email: 'bruno@innovate.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    status: 'novo',
    source: 'Indicacao',
    value: 28000,
    lastContact: '4 horas atras',
    company: 'Innovate Labs',
  },
  {
    id: '3',
    name: 'Carla Souza',
    email: 'carla@global.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    status: 'convertido',
    source: 'LinkedIn',
    value: 120000,
    lastContact: '1 dia atras',
    company: 'Global Tech',
  },
  {
    id: '4',
    name: 'Daniel Lima',
    email: 'daniel@startup.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    status: 'perdido',
    source: 'Facebook',
    value: 15000,
    lastContact: '2 dias atras',
    company: 'Fast Startup',
  },
  {
    id: '5',
    name: 'Elisa Rocha',
    email: 'elisa@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    status: 'em_negociacao',
    source: 'Email',
    value: 85000,
    lastContact: '3 dias atras',
    company: 'Enterprise X',
  },
]

export const pipelineData: NexusPipelineColumn[] = [
  {
    id: 'novo',
    title: 'Novo',
    color: '#3b82f6',
    leads: [
      { ...leadsData[1], id: 'l1' },
      { ...leadsData[0], id: 'l2', name: 'DataFlow', email: 'contato@dataflow.com', company: 'DataFlow', value: 18000 },
    ],
  },
  {
    id: 'qualificado',
    title: 'Qualificado',
    color: '#8b5cf6',
    leads: [
      { ...leadsData[0], id: 'l3', name: 'CloudSys', email: 'contato@cloudsys.com', company: 'CloudSys', value: 67000 },
      { ...leadsData[1], id: 'l4', name: 'NetPrime', email: 'contato@netprime.com', company: 'NetPrime', value: 41000 },
    ],
  },
  {
    id: 'proposta',
    title: 'Proposta',
    color: '#f59e0b',
    leads: [
      { ...leadsData[0], id: 'l5', name: 'MegaCorp', email: 'contato@megacorp.com', company: 'MegaCorp', value: 150000 },
      { ...leadsData[1], id: 'l6', name: 'SmartBiz', email: 'contato@smartbiz.com', company: 'SmartBiz', value: 89000 },
    ],
  },
  {
    id: 'negociacao',
    title: 'Negociacao',
    color: '#f97316',
    leads: [
      { ...leadsData[0], id: 'l7', name: 'GlobalTech', email: 'contato@globaltech.com', company: 'GlobalTech', value: 200000 },
      { ...leadsData[1], id: 'l8', name: 'FastScale', email: 'contato@fastscale.com', company: 'FastScale', value: 95000 },
    ],
  },
  {
    id: 'fechado',
    title: 'Fechado',
    color: '#10b981',
    leads: [
      { ...leadsData[2], id: 'l9', name: 'EnterpriseX', email: 'contato@enterprisex.com', company: 'EnterpriseX', value: 500000 },
      { ...leadsData[2], id: 'l10', name: 'BigData Co', email: 'contato@bigdata.com', company: 'BigData Co', value: 320000 },
    ],
  },
]

export const activitiesData: NexusActivity[] = [
  {
    id: '1',
    type: 'lead_created',
    description: 'Novo lead: TechCorp',
    timestamp: '2 minutos atras',
    user: currentUser,
  },
  {
    id: '2',
    type: 'deal_won',
    description: 'Negocio fechado: R$ 45.000',
    timestamp: '15 minutos atras',
    user: { ...currentUser, name: 'Ana Paula' },
  },
  {
    id: '3',
    type: 'task_completed',
    description: 'Tarefa completada: Follow-up',
    timestamp: '1 hora atras',
    user: { ...currentUser, name: 'Bruno Costa' },
  },
  {
    id: '4',
    type: 'email_sent',
    description: 'Email enviado: Proposta',
    timestamp: '2 horas atras',
    user: { ...currentUser, name: 'Carla Souza' },
  },
]

export const notificationsData: NexusNotification[] = [
  {
    id: '1',
    title: 'Novo lead qualificado',
    message: 'TechCorp entrou em contato via website',
    timestamp: '5 minutos atras',
    read: false,
  },
  {
    id: '2',
    title: 'Tarefa proxima do vencimento',
    message: 'Follow-up com GlobalTech vence em 2 horas',
    timestamp: '30 minutos atras',
    read: false,
  },
  {
    id: '3',
    title: 'Negocio fechado',
    message: 'Ana Paula fechou o negocio com EnterpriseX',
    timestamp: '1 hora atras',
    read: false,
  },
]

export const conversionChartData: NexusChartData[] = [
  { name: 'Jan', value: 18 },
  { name: 'Fev', value: 21 },
  { name: 'Mar', value: 19 },
  { name: 'Abr', value: 24 },
  { name: 'Mai', value: 26 },
  { name: 'Jun', value: 28 },
]

export const sourceChartData: NexusChartData[] = [
  { name: 'Website', value: 35, color: '#6366f1' },
  { name: 'Indicacao', value: 25, color: '#8b5cf6' },
  { name: 'LinkedIn', value: 20, color: '#3b82f6' },
  { name: 'Email', value: 12, color: '#06b6d4' },
  { name: 'Outros', value: 8, color: '#64748b' },
]

export const pipelineValueData: NexusChartData[] = [
  { name: 'Jan', value: 850000 },
  { name: 'Fev', value: 920000 },
  { name: 'Mar', value: 980000 },
  { name: 'Abr', value: 1050000 },
  { name: 'Mai', value: 1150000 },
  { name: 'Jun', value: 1200000 },
]
