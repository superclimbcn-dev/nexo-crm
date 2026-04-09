'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpDown,
  Calendar,
  Edit,
  Facebook,
  Filter,
  Globe,
  Linkedin,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/nexus/StatusBadge'
import { NEXUS_SOURCE_ICONS } from '@/lib/nexus/constants'
import type { NexusLead } from '@/types/nexus'

const sourceIconMap = {
  Globe,
  UserPlus,
  Linkedin,
  Facebook,
  Search,
  Calendar,
  Mail,
}

interface LeadsTableProps {
  leads: NexusLead[]
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof NexusLead; direction: 'asc' | 'desc' } | null>(null)

  const sortedLeads = useMemo(() => {
    const next = [...leads]
    if (!sortConfig) return next

    next.sort((left, right) => {
      const a = left[sortConfig.key]
      const b = right[sortConfig.key]
      if (a < b) return sortConfig.direction === 'asc' ? -1 : 1
      if (a > b) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return next
  }, [leads, sortConfig])

  const handleSort = (key: keyof NexusLead) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' }
      return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="overflow-hidden rounded-2xl border border-[#1c1f26] bg-[#161920]"
    >
      <div className="flex flex-col gap-4 border-b border-[#1c1f26] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white">Leads Recientes</h3>
          <p className="mt-2 text-sm text-[#9fb0ca]">Gestiona tus leads y sigue el progreso</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#2a2f3a] bg-transparent text-[#9fb0ca] hover:bg-[#1c1f26] hover:text-white">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button className="bg-indigo-500 text-white hover:bg-indigo-600">Ver todo</Button>
        </div>
      </div>

      <div className="px-3 pb-3 pt-1">
        <Table>
          <TableHeader>
            <TableRow className="border-[#1c1f26] hover:bg-transparent">
              <TableHead className="px-4 text-[#9fb0ca]">
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-white">
                  Lead
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="px-4 text-[#9fb0ca]">Status</TableHead>
              <TableHead className="px-4 text-[#9fb0ca]">Origen</TableHead>
              <TableHead className="px-4 text-[#9fb0ca]">
                <button onClick={() => handleSort('value')} className="flex items-center gap-1 hover:text-white">
                  Valor
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </TableHead>
              <TableHead className="px-4 text-[#9fb0ca]">Último Contacto</TableHead>
              <TableHead className="px-4 text-right text-[#9fb0ca]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.map((lead, index) => {
              const iconName = NEXUS_SOURCE_ICONS[lead.source] || 'Globe'
              const SourceIcon = sourceIconMap[iconName as keyof typeof sourceIconMap] || Globe
              const isHovered = hoveredRow === lead.id

              return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.04 }}
                  onHoverStart={() => setHoveredRow(lead.id)}
                  onHoverEnd={() => setHoveredRow(null)}
                  className={`border-[#1c1f26] ${isHovered ? 'bg-[#1c1f26]' : 'bg-transparent'}`}
                >
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-[#232834]">
                        <AvatarImage src={lead.avatar} alt={lead.name} />
                        <AvatarFallback className="bg-indigo-500/20 text-indigo-300">
                          {lead.name.split(' ').map((part) => part[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-base font-medium text-white">{lead.name}</p>
                        <p className="text-sm text-[#64748b]">{lead.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1f26]">
                        <SourceIcon className="h-4 w-4 text-[#9fb0ca]" />
                      </div>
                      <span className="text-base text-[#9fb0ca]">{lead.source}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-base font-semibold text-white">
                    {formatCurrency(lead.value)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-base text-[#9fb0ca]">{lead.lastContact}</TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {isHovered ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9fb0ca] hover:bg-indigo-500/10 hover:text-indigo-400">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9fb0ca] hover:bg-emerald-500/10 hover:text-emerald-400">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9fb0ca] hover:bg-[#232834] hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-[#1c1f26] bg-[#161920] text-white">
                          <DropdownMenuItem className="cursor-pointer hover:bg-[#1c1f26] focus:bg-[#1c1f26]">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  )
}
