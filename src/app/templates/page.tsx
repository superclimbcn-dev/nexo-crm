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
  X,
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
    name: 'Bienvenida',
    whatsappName: 'bienvenida',
    category: 'UTILITY',
    headerType: 'NONE',
    bodyText: 'Hola {{1}}. Bienvenido a Nexo Digital. ¿Cómo podemos ayudarte hoy?',
    status: 'APPROVED',
    language: 'es',
  },
  {
    id: '2',
    name: 'Promoción Black Friday',
    whatsappName: 'promocion_black_friday',
    category: 'MARKETING',
    headerType: 'IMAGE',
    bodyText: 'Black Friday. Aprovecha {{1}}% de descuento en todos los planes. Válido hasta {{2}}. No te lo pierdas.',
    status: 'APPROVED',
    language: 'es',
  },
  {
    id: '3',
    name: 'Seguimiento Postventa',
    whatsappName: 'seguimiento_postventa',
    category: 'UTILITY',
    headerType: 'NONE',
    bodyText: 'Hola {{1}}. ¿Todo bien con {{2}}? ¿Necesitas soporte? Estamos aquí para ayudarte.',
    status: 'APPROVED',
    language: 'es',
  },
  {
    id: '4',
    name: 'Recordatorio de Pago',
    whatsappName: 'recordatorio_pago',
    category: 'UTILITY',
    headerType: 'NONE',
    bodyText: 'Hola {{1}}. Tu factura por R$ {{2}} vence mañana. Accede aquí: {{3}}',
    status: 'PENDING',
    language: 'es',
  },
  {
    id: '5',
    name: 'Nueva Funcionalidad',
    whatsappName: 'nueva_funcionalidad',
    category: 'MARKETING',
    headerType: 'IMAGE',
    bodyText: 'Novedad. Lanzamos {{1}}. Revísalo ahora y aprovéchalo.',
    status: 'REJECTED',
    language: 'es',
  },
]

const categoryConfig = {
  MARKETING: { label: 'Marketing', color: 'bg-purple-500' },
  UTILITY: { label: 'Utilidad', color: 'bg-blue-500' },
  AUTHENTICATION: { label: 'Autenticación', color: 'bg-green-500' },
}

const statusConfig = {
  APPROVED: { label: 'Aprobado', color: 'text-emerald-500', icon: CheckCircle },
  PENDING: { label: 'Pendiente', color: 'text-yellow-500', icon: Clock },
  REJECTED: { label: 'Rechazado', color: 'text-red-500', icon: XCircle },
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(mockTemplates)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateWhatsappName, setNewTemplateWhatsappName] = useState('')
  const [newTemplateBodyText, setNewTemplateBodyText] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState<Template['category']>('UTILITY')

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.whatsappName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTemplate = () => {
    if (!newTemplateName || !newTemplateWhatsappName || !newTemplateBodyText) {
      alert('Por favor, completa todos los campos obligatorios')
      return
    }

    const newTemplate: Template = {
      id: String(Date.now()),
      name: newTemplateName,
      whatsappName: newTemplateWhatsappName,
      category: newTemplateCategory,
      headerType: 'NONE',
      bodyText: newTemplateBodyText,
      status: 'PENDING',
      language: 'es',
    }

    setTemplates([...templates, newTemplate])
    setShowNewTemplateModal(false)
    setNewTemplateName('')
    setNewTemplateWhatsappName('')
    setNewTemplateBodyText('')
    setNewTemplateCategory('UTILITY')
  }

  const handleEditTemplate = (template: Template) => {
    setTemplateToEdit(template)
    setNewTemplateName(template.name)
    setNewTemplateWhatsappName(template.whatsappName)
    setNewTemplateBodyText(template.bodyText)
    setNewTemplateCategory(template.category)
    setShowEditTemplateModal(true)
  }

  const handleUpdateTemplate = () => {
    if (!newTemplateName || !newTemplateWhatsappName || !newTemplateBodyText || !templateToEdit) {
      alert('Por favor, completa todos los campos obligatorios')
      return
    }

    const updatedTemplate: Template = {
      ...templateToEdit,
      name: newTemplateName,
      whatsappName: newTemplateWhatsappName,
      category: newTemplateCategory,
      bodyText: newTemplateBodyText,
      status: 'PENDING', // Cambia a pendiente para re-evaluación
    }

    setTemplates(templates.map(t => t.id === templateToEdit.id ? updatedTemplate : t))
    setShowEditTemplateModal(false)
    setTemplateToEdit(null)
    setNewTemplateName('')
    setNewTemplateWhatsappName('')
    setNewTemplateBodyText('')
    setNewTemplateCategory('UTILITY')
  }

  const handleCopyTemplate = (template: Template) => {
    const copiedTemplate: Template = {
      ...template,
      id: String(Date.now()),
      name: `${template.name} (Copia)`,
      whatsappName: `${template.whatsappName}_copy`,
      status: 'PENDING',
    }

    setTemplates([...templates, copiedTemplate])
  }

  const handleDeleteTemplate = (template: Template) => {
    setTemplateToDelete(template)
    setShowDeleteConfirmModal(true)
  }

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      setShowDeleteConfirmModal(false)
      setTemplateToDelete(null)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Plantillas</h1>
            <p className="text-muted-foreground">Gestiona tus plantillas aprobadas por WhatsApp</p>
          </div>
          <Button onClick={() => setShowNewTemplateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>

        {/* Modal Nueva Plantilla */}
        {showNewTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Nueva Plantilla</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowNewTemplateModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de la Plantilla</label>
                  <Input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Ej: Bienvenida"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nombre en WhatsApp</label>
                  <Input
                    value={newTemplateWhatsappName}
                    onChange={(e) => setNewTemplateWhatsappName(e.target.value)}
                    placeholder="Ej: bienvenida"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value as Template['category'])}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utilidad</option>
                    <option value="AUTHENTICATION">Autenticación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Texto del Mensaje</label>
                  <textarea
                    value={newTemplateBodyText}
                    onChange={(e) => setNewTemplateBodyText(e.target.value)}
                    placeholder="Ej: Hola {{1}}. Bienvenido a nuestra empresa."
                    rows={4}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowNewTemplateModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTemplate} className="flex-1">
                    Crear Plantilla
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Total de Plantillas</p>
            <p className="text-2xl font-bold">{templates.length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Aprobados</p>
            <p className="text-2xl font-bold text-emerald-500">
              {templates.filter((t) => t.status === 'APPROVED').length}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-500">
              {templates.filter((t) => t.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Rechazados</p>
            <p className="text-2xl font-bold text-red-500">
              {templates.filter((t) => t.status === 'REJECTED').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantillas..."
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