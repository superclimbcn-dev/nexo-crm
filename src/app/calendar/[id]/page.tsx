import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { AppointmentForm } from '@/components/calendar/AppointmentForm'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { setAppointmentStatusAction, updateAppointmentAction } from '../actions'

export const dynamic = 'force-dynamic'

function inputDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default async function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const [appointment, contacts, users] = await Promise.all([
    prisma.appointment.findUnique({ where: { id: params.id } }),
    prisma.contact.findMany({ orderBy: { updatedAt: 'desc' }, select: { id: true, name: true, company: true, phoneNumber: true } }),
    prisma.user.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, email: true } }),
  ])
  if (!appointment) notFound()
  return <MainLayout><div className="mx-auto max-w-4xl space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold">Servicio programado</h1><p className="text-muted-foreground">Edita, reprograma o actualiza su estado sin perder el historial.</p></div><div className="flex gap-2"><Button asChild variant="outline"><Link href="/calendar"><ArrowLeft className="mr-2 h-4 w-4" />Agenda</Link></Button>{appointment.status !== 'COMPLETED' ? <form action={setAppointmentStatusAction}><input name="id" type="hidden" value={appointment.id} /><input name="status" type="hidden" value="COMPLETED" /><Button variant="outline"><CheckCircle className="mr-2 h-4 w-4" />Completar</Button></form> : null}{appointment.status !== 'CANCELLED' ? <form action={setAppointmentStatusAction}><input name="id" type="hidden" value={appointment.id} /><input name="status" type="hidden" value="CANCELLED" /><Button variant="destructive"><XCircle className="mr-2 h-4 w-4" />Cancelar servicio</Button></form> : null}</div></div><AppointmentForm action={updateAppointmentAction} contacts={contacts.map(contact => ({ id: contact.id, label: contact.company || contact.name || contact.phoneNumber }))} users={users.map(user => ({ id: user.id, label: user.name || user.email }))} showStatus initial={{ id: appointment.id, contactId: appointment.contactId ?? '', dealId: appointment.dealId ?? '', title: appointment.title, serviceType: appointment.serviceType, date: inputDate(appointment.scheduledAt), time: appointment.scheduledAt.toTimeString().slice(0, 5), durationMinutes: appointment.durationMinutes, address: appointment.address ?? '', municipality: appointment.municipality ?? '', assignedToId: appointment.assignedToId ?? '', value: appointment.value ? Number(appointment.value).toFixed(2) : '', notes: appointment.notes ?? '', status: appointment.status }} /></div></MainLayout>
}
