import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { CalendarDays, Clock, MapPin, Plus, UserRound } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APPOINTMENT_SERVICE_LABELS, APPOINTMENT_STATUS_LABELS } from '@/lib/calendar/appointments'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type View = 'today' | 'week' | 'upcoming'

function dayStart(date = new Date()) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()) }
function addDays(date: Date, days: number) { const result = new Date(date); result.setDate(result.getDate() + days); return result }

export default async function CalendarPage({ searchParams }: { searchParams?: { view?: string } }) {
  const view: View = searchParams?.view === 'week' || searchParams?.view === 'upcoming' ? searchParams.view : 'today'
  const now = new Date()
  const today = dayStart(now)
  const tomorrow = addDays(today, 1)
  const weekEnd = addDays(today, 7)
  const where: Prisma.AppointmentWhereInput = view === 'today'
    ? { scheduledAt: { gte: today, lt: tomorrow } }
    : view === 'week'
      ? { scheduledAt: { gte: today, lt: weekEnd } }
      : { scheduledAt: { gte: now }, status: { in: ['SCHEDULED', 'CONFIRMED'] } }
  const appointments = await prisma.appointment.findMany({
    where,
    include: { contact: { select: { name: true, company: true, phoneNumber: true } }, assignedTo: { select: { name: true, email: true } } },
    orderBy: { scheduledAt: 'asc' },
  })

  return <MainLayout><div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold">Agenda</h1><p className="text-muted-foreground">Fuente oficial de los servicios programados de Superclim.</p></div><Button asChild><Link href="/calendar/new"><Plus className="mr-2 h-4 w-4" />Nuevo servicio</Link></Button></div>
    <nav className="flex flex-wrap gap-2">{([['today', 'Hoy'], ['week', 'Semana'], ['upcoming', 'Próximos']] as const).map(([id, label]) => <Button asChild key={id} variant={view === id ? 'default' : 'outline'}><Link href={`/calendar?view=${id}`}>{label}</Link></Button>)}</nav>
    <section className="rounded-2xl border border-border bg-card p-6"><div className="mb-5 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">{view === 'today' ? `Hoy — ${today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}` : view === 'week' ? 'Servicios de los próximos 7 días' : 'Próximos servicios'}</h2></div>
      <div className="space-y-3">{appointments.length ? appointments.map(appointment => {
        const clientName = appointment.contact?.company || appointment.contact?.name || appointment.contact?.phoneNumber || 'Cliente sin asignar'
        return <Link className="grid gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/50 md:grid-cols-[100px_1fr_auto]" href={`/calendar/${appointment.id}`} key={appointment.id}><div><p className="text-lg font-bold">{appointment.scheduledAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p><p className="text-xs text-muted-foreground">{appointment.scheduledAt.toLocaleDateString('es-ES')}</p></div><div><h3 className="font-semibold">{clientName}</h3><p className="text-sm text-muted-foreground">{APPOINTMENT_SERVICE_LABELS[appointment.serviceType]}</p><div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">{appointment.municipality ? <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{appointment.municipality}</span> : null}<span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{appointment.durationMinutes} min</span>{appointment.assignedTo ? <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{appointment.assignedTo.name || appointment.assignedTo.email}</span> : null}</div></div><Badge variant="outline">{APPOINTMENT_STATUS_LABELS[appointment.status]}</Badge></Link>
      }) : <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No hay servicios en esta vista.</div>}</div>
    </section>
  </div></MainLayout>
}
