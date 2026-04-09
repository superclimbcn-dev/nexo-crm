'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MoreHorizontal, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { NexusLead, NexusPipelineColumn } from '@/types/nexus'

function KanbanCard({ lead, overlay = false }: { lead: NexusLead; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: lead,
  })

  const style = transform ? { transform: CSS.Transform.toString(transform) } : undefined

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ y: -2, boxShadow: '0 10px 32px rgba(0,0,0,0.28)' }}
      className={`rounded-xl border border-[#1c1f26] bg-[#161920] p-3 ${
        overlay ? 'rotate-2 shadow-2xl' : ''
      } ${isDragging ? 'opacity-60' : 'opacity-100'}`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-medium text-white">{lead.company}</h4>
        <span className="text-xs font-medium text-emerald-400">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
          }).format(lead.value)}
        </span>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={lead.avatar} alt={lead.name} />
          <AvatarFallback className="bg-indigo-500/20 text-[10px] text-indigo-300">
            {lead.name.split(' ').map((part) => part[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-[#9fb0ca]">{lead.name}</span>
      </div>
      <div className="flex items-center justify-between text-[#64748b]">
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          <span>{lead.lastContact}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[#64748b] hover:bg-[#1c1f26] hover:text-white"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  )
}

function KanbanColumn({ column }: { column: NexusPipelineColumn }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: column,
  })

  return (
    <div className="w-72 flex-shrink-0">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="text-sm font-semibold text-white">{column.title}</h3>
          <span className="rounded-full bg-[#1c1f26] px-2 py-0.5 text-xs text-[#9fb0ca]">
            {column.leads.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[#64748b] hover:bg-[#1c1f26] hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[360px] space-y-3 rounded-2xl p-3 transition-colors ${
          isOver ? 'bg-indigo-500/10' : 'bg-[#1c1f26]'
        }`}
      >
        {column.leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  columns: NexusPipelineColumn[]
}

export function KanbanBoard({ columns: initialColumns }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns)
  const [activeLead, setActiveLead] = useState<NexusLead | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveLead(event.active.data.current as NexusLead)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)
    if (!over) return

    const leadId = String(active.id)
    const targetColumnId = String(over.id)
    const sourceColumn = columns.find((column) =>
      column.leads.some((lead) => lead.id === leadId)
    )
    if (!sourceColumn || sourceColumn.id === targetColumnId) return

    const movedLead = sourceColumn.leads.find((lead) => lead.id === leadId)
    if (!movedLead) return

    setColumns((current) =>
      current.map((column) => {
        if (column.id === sourceColumn.id) {
          return { ...column, leads: column.leads.filter((lead) => lead.id !== leadId) }
        }
        if (column.id === targetColumnId) {
          return { ...column, leads: [...column.leads, movedLead] }
        }
        return column
      })
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="overflow-hidden rounded-2xl border border-[#1c1f26] bg-[#161920]"
    >
      <div className="flex items-center justify-between border-b border-[#1c1f26] px-6 py-5">
        <div>
          <h3 className="text-2xl font-semibold text-white">Pipeline de Ventas</h3>
          <p className="mt-1 text-sm text-[#9fb0ca]">Arrastra las tarjetas para moverlas entre etapas</p>
        </div>
        <Button className="bg-indigo-500 text-white hover:bg-indigo-600">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Oportunidad
        </Button>
      </div>

      <div className="overflow-x-auto p-6">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex min-w-max gap-4">
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column} />
            ))}
          </div>
          <DragOverlay>{activeLead ? <KanbanCard lead={activeLead} overlay /> : null}</DragOverlay>
        </DndContext>
      </div>
    </motion.div>
  )
}
