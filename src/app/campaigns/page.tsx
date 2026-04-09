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
  BarChart3,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Search,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  templateName: string
  audienceCount: number
  stats: {
    sent: number
    delivered: number
    read: number
    failed: number
  }
  scheduledAt: string | null
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Black Friday 2024',
    status: 'COMPLETED',
    templateName: 'promocion_black_friday',
    audienceCount: 1250,
    stats: { sent: 1250, delivered: 1187, read: 892, failed: 63 },
    scheduledAt: '2024-11-29T00:00:00Z',
  },
  {
    id: '2',
    name: 'Lanzamiento de Nuevo Producto',
    status: 'RUNNING',
    templateName: 'lanzamiento_producto',
    audienceCount: 500,
    stats: { sent: 320, delivered: 310, read: 245, failed: 10 },
    scheduledAt: null,
  },
  {
    id: '3',
    name: 'Seguimiento de Clientes Inactivos',
    status: 'SCHEDULED',
    templateName: 'seguimiento_inactivos',
    audienceCount: 800,
    stats: { sent: 0, delivered: 0, read: 0, failed: 0 },
    scheduledAt: '2024-02-15T10:00:00Z',
  },
  {
    id: '4',
    name: 'Encuesta de Satisfacción',
    status: 'DRAFT',
    templateName: 'encuesta_satisfaccion',
    audienceCount: 2000,
    stats: { sent: 0, delivered: 0, read: 0, failed: 0 },
    scheduledAt: null,
  },
]

const statusConfig = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-500', icon: Clock },
  SCHEDULED: { label: 'Programada', color: 'bg-blue-500', icon: Calendar },
  RUNNING: { label: 'Enviando', color: 'bg-yellow-500', icon: Play },
  PAUSED: { label: 'Pausada', color: 'bg-orange-500', icon: Pause },
  COMPLETED: { label: 'Completada', color: 'bg-green-500', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500', icon: XCircle },
}

export default function CampaignsPage() {
  const [campaigns] = useState(mockCampaigns)

  const getStatusBadge = (status: Campaign['status']) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getProgressPercentage = (campaign: Campaign) => {
    if (campaign.audienceCount === 0) return 0
    return Math.round((campaign.stats.sent / campaign.audienceCount) * 100)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Campañas</h1>
            <p className="text-muted-foreground">Envía mensajes masivos a tus contactos</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Campaña
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Campañas Activas</p>
            <p className="text-2xl font-bold">{campaigns.filter((c) => c.status === 'RUNNING').length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Total Enviado (Mes)</p>
            <p className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.stats.sent, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Tasa de Entrega</p>
            <p className="text-2xl font-bold text-emerald-500">94.2%</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Tasa de Lectura</p>
            <p className="text-2xl font-bold text-blue-500">68.5%</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar campañas..." className="pl-10" />
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Plantilla: {campaign.templateName}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {campaign.audienceCount.toLocaleString()} contactos
                    </div>
                    {campaign.scheduledAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(campaign.scheduledAt)}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  {campaign.status !== 'DRAFT' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progreso</span>
                        <span>{getProgressPercentage(campaign)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${getProgressPercentage(campaign)}%` }}
                        />
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-emerald-500">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Enviadas: {campaign.stats.sent}
                        </span>
                        <span className="text-blue-500">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          Leídas: {campaign.stats.read}
                        </span>
                        <span className="text-red-500">
                          <XCircle className="w-3 h-3 inline mr-1" />
                          Fallos: {campaign.stats.failed}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {campaign.status === 'RUNNING' && (
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </Button>
                  )}
                  {campaign.status === 'PAUSED' && (
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Reanudar
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
