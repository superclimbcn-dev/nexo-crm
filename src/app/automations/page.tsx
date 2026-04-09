'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Bot,
  MessageSquare,
  Clock,
  Zap,
  Search,
  TrendingUp,
} from 'lucide-react'

interface Automation {
  id: string
  name: string
  triggerType: 'KEYWORD' | 'NEW_CONVERSATION' | 'INACTIVITY' | 'SCHEDULE'
  triggerConfig: Record<string, any>
  isActive: boolean
  executionCount: number
  lastExecutedAt: string | null
}

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Respuesta Automática - Precio',
    triggerType: 'KEYWORD',
    triggerConfig: { keywords: ['precio', 'valor', 'costo', 'cuánto'] },
    isActive: true,
    executionCount: 145,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    name: 'Bienvenida Nuevo Contacto',
    triggerType: 'NEW_CONVERSATION',
    triggerConfig: {},
    isActive: true,
    executionCount: 523,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '3',
    name: 'Seguimiento por Inactividad',
    triggerType: 'INACTIVITY',
    triggerConfig: { delay: 30 },
    isActive: true,
    executionCount: 89,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '4',
    name: 'Recordatorio Mensual',
    triggerType: 'SCHEDULE',
    triggerConfig: { cron: '0 9 1 * *' },
    isActive: false,
    executionCount: 12,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  },
]

const triggerConfig = {
  KEYWORD: { label: 'Palabra clave', icon: MessageSquare, color: 'bg-blue-500' },
  NEW_CONVERSATION: { label: 'Nuevo Contacto', icon: Zap, color: 'bg-green-500' },
  INACTIVITY: { label: 'Inactividad', icon: Clock, color: 'bg-orange-500' },
  SCHEDULE: { label: 'Programado', icon: TrendingUp, color: 'bg-purple-500' },
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(mockAutomations)

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((auto) =>
        auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
      )
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Automatizaciones</h1>
            <p className="text-muted-foreground">Configura respuestas automáticas y flujos de chatbot</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Automatización
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Automatizaciones Activas</p>
            <p className="text-2xl font-bold text-emerald-500">
              {automations.filter((a) => a.isActive).length}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Total de Ejecuciones</p>
            <p className="text-2xl font-bold">
              {automations.reduce((sum, a) => sum + a.executionCount, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Ejecuciones Hoy</p>
            <p className="text-2xl font-bold text-blue-500">47</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
            <p className="text-2xl font-bold text-purple-500">98.2%</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar automatizaciones..." className="pl-10" />
        </div>

        {/* Automations List */}
        <div className="space-y-4">
          {automations.map((automation) => {
            const trigger = triggerConfig[automation.triggerType]
            const TriggerIcon = trigger.icon

            return (
              <div
                key={automation.id}
                className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{automation.name}</h3>
                      <Badge className={`${trigger.color} text-white`}>
                        <TriggerIcon className="w-3 h-3 mr-1" />
                        {trigger.label}
                      </Badge>
                      {automation.isActive ? (
                        <Badge variant="outline" className="text-emerald-500">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Pausada
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        {automation.executionCount.toLocaleString()} ejecuciones
                      </div>
                      {automation.lastExecutedAt && (
                        <div>
                          Última ejecución:{' '}
                          {new Date(automation.lastExecutedAt).toLocaleString('es-ES')}
                        </div>
                      )}
                    </div>

                    {/* Trigger Details */}
                    <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                      {automation.triggerType === 'KEYWORD' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Palabras clave:</span>
                          <div className="flex gap-1">
                            {automation.triggerConfig.keywords.map((kw: string) => (
                              <Badge key={kw} variant="secondary">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {automation.triggerType === 'INACTIVITY' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Disparar después de {automation.triggerConfig.delay} minutos de inactividad
                          </span>
                        </div>
                      )}
                      {automation.triggerType === 'SCHEDULE' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Cron: {automation.triggerConfig.cron}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAutomation(automation.id)}
                    >
                      {automation.isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Activar
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}
