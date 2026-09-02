import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageSquare, Save } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { prisma } from '@/lib/prisma'
import { updateDealAction } from '../actions'

const stages = [
  ['NEW', 'Nuevo'], ['QUALIFIED', 'Calificado'], ['PROPOSAL', 'Propuesta'],
  ['NEGOTIATION', 'Negociación'], ['CLOSED_WON', 'Ganado'], ['CLOSED_LOST', 'Perdido'],
] as const

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const [deal, users] = await Promise.all([
    prisma.deal.findUnique({ where: { id: params.id }, include: { contact: true, conversation: true } }),
    prisma.user.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, email: true } }),
  ])
  if (!deal) notFound()

  return (
    <MainLayout><div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Editar oportunidad</h1><p className="text-muted-foreground">{deal.contact.company || deal.contact.name || deal.contact.phoneNumber}</p></div><Button asChild variant="outline"><Link href="/crm"><ArrowLeft className="mr-2 h-4 w-4" />Pipeline</Link></Button></div>
      <form action={updateDealAction} className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
        <input name="id" type="hidden" value={deal.id} />
        <Field defaultValue={deal.title} label="Título" name="title" required />
        <Field defaultValue={Number(deal.value ?? 0).toFixed(2)} label="Valor (€)" name="value" required type="number" />
        <div className="space-y-2"><label className="text-sm font-medium" htmlFor="stage">Etapa</label><select className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" defaultValue={deal.stage} id="stage" name="stage">{stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <Field defaultValue={String(deal.probability)} label="Probabilidad" name="probability" required type="number" />
        <Field defaultValue={deal.expectedClose?.toISOString().slice(0, 10) ?? ''} label="Próxima acción / cierre estimado" name="expectedClose" type="date" />
        <div className="space-y-2"><label className="text-sm font-medium" htmlFor="assignedToId">Responsable</label><select className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" defaultValue={deal.assignedToId ?? ''} id="assignedToId" name="assignedToId"><option value="">Sin asignar</option>{users.map(user => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}</select></div>
        <Field defaultValue={deal.source ?? ''} label="Origen" name="source" />
        <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium" htmlFor="notes">Notas</label><textarea className="min-h-28 w-full rounded-md border border-border bg-background p-3 text-sm" defaultValue={deal.notes ?? ''} id="notes" name="notes" /></div>
        <div className="flex justify-end gap-2 md:col-span-2">{deal.conversation ? <Button asChild variant="outline"><Link href={`/conversations/${deal.conversation.id}`}><MessageSquare className="mr-2 h-4 w-4" />Conversación</Link></Button> : null}<Button type="submit"><Save className="mr-2 h-4 w-4" />Guardar cambios</Button></div>
      </form>
    </div></MainLayout>
  )
}

function Field({ defaultValue, label, name, required = false, type = 'text' }: { defaultValue: string; label: string; name: string; required?: boolean; type?: string }) { return <div className="space-y-2"><label className="text-sm font-medium" htmlFor={name}>{label}</label><Input defaultValue={defaultValue} id={name} name={name} required={required} step={type === 'number' ? '0.01' : undefined} type={type} /></div> }
