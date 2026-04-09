'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Tag,
  Upload,
  Download,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

const mockContacts = [
  {
    id: '1',
    name: 'Ana Paula Mendes',
    avatar: null,
    phone: '5511999999999',
    email: 'ana@nexo.com',
    company: 'TechCorp',
    source: 'Sitio web',
    tags: [{ name: 'VIP', color: '#f59e0b' }, { name: 'Cliente', color: '#10b981' }],
    lastContact: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    name: 'Bruno Costa',
    avatar: null,
    phone: '5511888888888',
    email: 'bruno@startup.com',
    company: 'StartupXYZ',
    source: 'Indicación',
    tags: [{ name: 'Nuevo', color: '#3b82f6' }],
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    name: 'Carla Souza',
    avatar: null,
    phone: '5511777777777',
    email: 'carla@global.com',
    company: 'Global Inc',
    source: 'LinkedIn',
    tags: [{ name: 'Prospect', color: '#8b5cf6' }],
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '4',
    name: 'Daniel Lima',
    avatar: null,
    phone: '5511666666666',
    email: 'daniel@fast.com',
    company: 'Fast Solutions',
    source: 'Google Ads',
    tags: [{ name: 'Cliente', color: '#10b981' }],
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contactos</h1>
            <p className="text-muted-foreground">Gestiona tus contactos y leads</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Contacto
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Contacts Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contacto</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Teléfono</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Empresa</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Origen</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Etiquetas</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Último Contacto</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contact.avatar || ''} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{contact.company}</td>
                  <td className="p-4">
                    <Badge variant="outline">{contact.source}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {contact.tags.map((tag) => (
                        <span
                          key={tag.name}
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatRelativeTime(contact.lastContact)}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
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
