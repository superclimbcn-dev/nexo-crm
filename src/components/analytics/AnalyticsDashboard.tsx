'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
} from 'lucide-react'

interface AnalyticsDashboardProps {
  messagesToday: number
  totalContacts: number
}

const messageData = [
  { name: 'Lun', enviadas: 120, recibidas: 85 },
  { name: 'Mar', enviadas: 150, recibidas: 110 },
  { name: 'Mié', enviadas: 180, recibidas: 140 },
  { name: 'Jue', enviadas: 140, recibidas: 95 },
  { name: 'Vie', enviadas: 200, recibidas: 160 },
  { name: 'Sáb', enviadas: 80, recibidas: 60 },
  { name: 'Dom', enviadas: 60, recibidas: 45 },
]

const sourceData = [
  { name: 'Sitio web', value: 35, color: '#6366f1' },
  { name: 'Indicación', value: 25, color: '#8b5cf6' },
  { name: 'LinkedIn', value: 20, color: '#3b82f6' },
  { name: 'Google Ads', value: 12, color: '#06b6d4' },
  { name: 'Otros', value: 8, color: '#64748b' },
]

const pipelineData = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 48000 },
  { name: 'Abr', value: 61000 },
  { name: 'May', value: 75000 },
  { name: 'Jun', value: 82000 },
]

const agentPerformance = [
  { name: 'Carlos', respuestas: 145, tiempo: 3.2, satisfaccion: 4.8 },
  { name: 'Ana', respuestas: 132, tiempo: 2.8, satisfaccion: 4.9 },
  { name: 'Bruno', respuestas: 128, tiempo: 4.1, satisfaccion: 4.5 },
  { name: 'Marina', respuestas: 156, tiempo: 2.5, satisfaccion: 4.7 },
]

export function AnalyticsDashboard({
  messagesToday,
  totalContacts,
}: AnalyticsDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Análisis</h1>
          <p className="text-muted-foreground">Métricas e informes de tu atención</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mensajes Hoy</p>
                <p className="text-2xl font-bold">{messagesToday}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Conteo real desde la base de datos</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalContacts}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Contactos reales registrados en CRM</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Respuesta</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="mt-2 text-xs text-emerald-500">+2.1% vs mes pasado</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Medio</p>
                <p className="text-2xl font-bold">3.2m</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <p className="mt-2 text-xs text-emerald-500">-0.5m vs mes pasado</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Volumen de Mensajes</h3>
            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={messageData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161920',
                      border: '1px solid #1c1f26',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="enviadas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recibidas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Origen de los Contactos</h3>
            <div className="flex h-64 items-center">
              <ResponsiveContainer height="100%" width="60%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={sourceData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161920',
                      border: '1px solid #1c1f26',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-40 space-y-2">
                {sourceData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="ml-auto text-sm">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Evolución del Pipeline</h3>
            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={pipelineData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161920',
                      border: '1px solid #1c1f26',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    dataKey="value"
                    fill="url(#colorValue)"
                    fillOpacity={1}
                    stroke="#10b981"
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Rendimiento por agente</h3>
            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={agentPerformance} layout="vertical">
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis stroke="#64748b" type="number" />
                  <YAxis dataKey="name" stroke="#64748b" type="category" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161920',
                      border: '1px solid #1c1f26',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="respuestas" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="text-lg font-semibold">Detalles por Agente</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Agente</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Respuestas</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Tiempo Medio</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Satisfacción</th>
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {agentPerformance.map((agent) => (
                <tr key={agent.name} className="border-b border-border hover:bg-secondary/50">
                  <td className="p-4 font-medium">{agent.name}</td>
                  <td className="p-4">{agent.respuestas}</td>
                  <td className="p-4">{agent.tiempo}m</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>{agent.satisfaccion}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className="text-emerald-500" variant="outline">
                      En línea
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}
