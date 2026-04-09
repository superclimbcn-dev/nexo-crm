'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  MoreVertical,
  Phone,
  Calendar,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Deal {
  id: string
  title: string
  contact: {
    name: string
    avatar?: string
  }
  value: number
  stage: string
  probability: number
  expectedClose: string
}

const stages = [
  { id: 'new', name: 'Novo', color: '#3b82f6' },
  { id: 'qualified', name: 'Qualificado', color: '#8b5cf6' },
  { id: 'proposal', name: 'Proposta', color: '#f59e0b' },
  { id: 'negotiation', name: 'Negociação', color: '#f97316' },
  { id: 'closed_won', name: 'Ganho', color: '#10b981' },
  { id: 'closed_lost', name: 'Perdido', color: '#ef4444' },
]

const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'TechCorp - Plano Enterprise',
    contact: { name: 'Ana Paula' },
    value: 45000,
    stage: 'negotiation',
    probability: 70,
    expectedClose: '2024-02-15',
  },
  {
    id: '2',
    title: 'StartupXYZ - Plano Pro',
    contact: { name: 'Bruno Costa' },
    value: 12000,
    stage: 'proposal',
    probability: 50,
    expectedClose: '2024-02-10',
  },
  {
    id: '3',
    title: 'Global Inc - Plano Enterprise',
    contact: { name: 'Carla Souza' },
    value: 85000,
    stage: 'qualified',
    probability: 30,
    expectedClose: '2024-03-01',
  },
  {
    id: '4',
    title: 'Fast Solutions - Plano Starter',
    contact: { name: 'Daniel Lima' },
    value: 5000,
    stage: 'new',
    probability: 20,
    expectedClose: '2024-02-20',
  },
  {
    id: '5',
    title: 'MegaCorp - Plano Enterprise',
    contact: { name: 'Elisa Rocha' },
    value: 150000,
    stage: 'closed_won',
    probability: 100,
    expectedClose: '2024-01-30',
  },
]

export default function CRMPage() {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [deals, setDeals] = useState(mockDeals)

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    if (draggedDeal) {
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === draggedDeal.id ? { ...deal, stage: stageId } : deal
        )
      )
      setDraggedDeal(null)
    }
  }

  const getDealsByStage = (stageId: string) => {
    return deals.filter((deal) => deal.stage === stageId)
  }

  const getStageTotal = (stageId: string) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + deal.value, 0)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pipeline de Vendas</h1>
            <p className="text-muted-foreground">Gerencie suas oportunidades</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar deals..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Oportunidade
            </Button>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Total em Pipeline</p>
            <p className="text-2xl font-bold">
              {formatCurrency(deals.reduce((sum, d) => sum + d.value, 0))}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Deals Ativos</p>
            <p className="text-2xl font-bold">{deals.filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <p className="text-2xl font-bold">24.8%</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Ganho este mês</p>
            <p className="text-2xl font-bold text-emerald-500">
              {formatCurrency(deals.filter((d) => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0))}
            </p>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium">{stage.name}</span>
                  <Badge variant="secondary">{getDealsByStage(stage.id).length}</Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(getStageTotal(stage.id))}
                </span>
              </div>

              {/* Column Body */}
              <div className="bg-secondary/50 rounded-lg p-3 min-h-[400px] space-y-3">
                {getDealsByStage(stage.id).map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    className="bg-card p-4 rounded-lg border border-border cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{deal.title}</h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {deal.contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{deal.contact.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-emerald-500">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{formatCurrency(deal.value)}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {deal.probability}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Fecha em {new Date(deal.expectedClose).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
