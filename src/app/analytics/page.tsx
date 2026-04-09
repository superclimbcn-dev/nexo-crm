'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
} from 'lucide-react'

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
  { name: 'Carlos', respostas: 145, tempo: 3.2, satisfacao: 4.8 },
  { name: 'Ana', respostas: 132, tempo: 2.8, satisfacao: 4.9 },
  { name: 'Bruno', respostas: 128, tempo: 4.1, satisfacao: 4.5 },
  { name: 'Marina', respostas: 156, tempo: 2.5, satisfacao: 4.7 },
]

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Análisis</h1>
          <p className="text-muted-foreground">Métricas e informes de tu atención</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversaciones Hoy</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-xs text-emerald-500 mt-2">+12% vs ayer</p>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nuevos Contactos</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-emerald-500 mt-2">+5% vs semana pasada</p>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Respuesta</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-xs text-emerald-500 mt-2">+2.1% vs mes pasado</p>
          </div>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Medio</p>
                <p className="text-2xl font-bold">3.2m</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-emerald-500 mt-2">-0.5m vs mes pasado</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Messages Chart */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Volumen de Mensajes</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={messageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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

          {/* Source Pie Chart */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Origen de los Contactos</h3>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
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
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline Value Chart */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Evolución del Pipeline</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pipelineData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rendimiento por Agente */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Rendimiento por agente</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="name" type="category" stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#161920',
                      border: '1px solid #1c1f26',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="respostas" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Agent Details Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold">Detalles por Agente</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Agente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Respuestas</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tiempo Medio</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Satisfacción</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {agentPerformance.map((agent) => (
                <tr key={agent.name} className="border-b border-border hover:bg-secondary/50">
                  <td className="p-4 font-medium">{agent.name}</td>
                  <td className="p-4">{agent.respostas}</td>
                  <td className="p-4">{agent.tempo}m</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span>{agent.satisfacao}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-emerald-500">
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
