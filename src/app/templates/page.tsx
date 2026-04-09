'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Image,
  FileText,
} from 'lucide-react'

interface Template {
  id: string
  name: string
  whatsappName: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  headerType: 'NONE' | 'TEXT' | 'IMAGE'
  bodyText: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  language: string
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Boas-vindas',
    whatsappName: 'boas_vindas',
    category: 'UTILITY',
    headerType: 'NONE',
    bodyText: 'Olá {{1}}! Bem-vindo à Nexo Digital. Como podemos ajudar você hoje?',
    status: 'APPROVED',
    language: 'pt_BR',
  },
  {
    id: '2',
    name: 'Promoção Black Friday',
    whatsappName: 'promocao_black_friday',
    category: 'MARKETING',
    headerType: 'IMAGE',
    bodyText: '🎉 Black Friday! Aproveite {{1}}% de desconto em todos os planos. Válido até {{2}}. Não perca!',
    status: 'APPROVED',
    language: 'pt_BR',
  },
  {
    id: '3',
    name: 'Follow-up Pós-venda',
    whatsappName: 'follow_up_pos_venda',
    category: 'UTILITY',
    headerType: 'NONE',
    bodyText: 'Olá {{1}}! Tudo bem com o {{2}}? Precisa de algum suporte? Estamos aqui para ajudar!',
    status: 'APPROVED',
    language: 'pt_BR',
  },
  {
    id: '4',
    name: 'Lembrete de Pagamento',
    whatsappName: 'lembrete_pagamento',
    category: 'UTILITY',
    headerType: 'NONE',
    bodyText: 'Olá {{1}}! Seu boleto no valor de R$ {{2}} vence amanhã. Acesse: {{3}}',
    status: 'PENDING',
    language: 'pt_BR',
  },
  {
    id: '5',
    name: 'Nova Funcionalidade',
    whatsappName: 'nova_funcionalidade',
    category: 'MARKETING',
    headerType: 'IMAGE',
    bodyText: '🚀 Novidade! Lançamos {{1}}. Confira agora e aproveite!',
    status: 'REJECTED',
    language: 'pt_BR',
  },
]

const categoryConfig = {
  MARKETING: { label: 'Marketing', color: 'bg-purple-500' },
  UTILITY: { label: 'Utilidade', color: 'bg-blue-500' },
  AUTHENTICATION: { label: 'Autenticação', color: 'bg-green-500' },
}

const statusConfig = {
  APPROVED: { label: 'Aprovado', color: 'text-emerald-500', icon: CheckCircle },
  PENDING: { label: 'Pendente', color: 'text-yellow-500', icon: Clock },
  REJECTED: { label: 'Rejeitado', color: 'text-red-500', icon: XCircle },
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(mockTemplates)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.whatsappName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Templates</h1>
            <p className="text-muted-foreground">Gerencie seus templates aprovados pelo WhatsApp</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Total de Templates</p>
            <p className="text-2xl font-bold">{templates.length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Aprovados</p>
            <p className="text-2xl font-bold text-emerald-500">
              {templates.filter((t) => t.status === 'APPROVED').length}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-500">
              {templates.filter((t) => t.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Rejeitados</p>
            <p className="text-2xl font-bold text-red-500">
              {templates.filter((t) => t.status === 'REJECTED').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const category = categoryConfig[template.category]
            const status = statusConfig[template.status]
            const StatusIcon = status.icon

            return (
              <div
                key={template.id}
                className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge className={`${category.color} text-white text-xs`}>
                        {category.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.whatsappName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-[#075e54] rounded-lg p-4 mb-4">
                  {template.headerType === 'IMAGE' && (
                    <div className="mb-2">
                      <div className="w-full h-32 bg-gray-600 rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                  <p className="text-white text-sm whitespace-pre-wrap">{template.bodyText}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {template.language}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
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
