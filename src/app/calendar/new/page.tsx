import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { AppointmentForm } from '@/components/calendar/AppointmentForm'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { createAppointmentAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewAppointmentPage({ searchParams }: { searchParams?: { contactId?: string; dealId?: string } }) {
  const [contacts, users, deal] = await Promise.all([
    prisma.contact.findMany({ orderBy: { updatedAt: 'desc' }, select: { id: true, name: true, company: true, phoneNumber: true } }),
    prisma.user.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, email: true } }),
    searchParams?.dealId ? prisma.deal.findUnique({ where: { id: searchParams.dealId }, select: { id: true, contactId: true, title: true, value: true } }) : null,
  ])
  const contactId = deal?.contactId || searchParams?.contactId || ''
  return <MainLayout><div className="mx-auto max-w-4xl space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Nuevo servicio</h1><p className="text-muted-foreground">Programa un servicio y comprueba automáticamente posibles conflictos.</p></div><Button asChild variant="outline"><Link href="/calendar"><ArrowLeft className="mr-2 h-4 w-4" />Agenda</Link></Button></div><AppointmentForm action={createAppointmentAction} contacts={contacts.map(contact => ({ id: contact.id, label: contact.company || contact.name || contact.phoneNumber }))} users={users.map(user => ({ id: user.id, label: user.name || user.email }))} initial={{ contactId, dealId: deal?.id, title: deal?.title, value: deal?.value ? Number(deal.value).toFixed(2) : '' }} /></div></MainLayout>
}
