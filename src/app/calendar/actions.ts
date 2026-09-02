'use server'

import { AppointmentServiceType, AppointmentStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAppointmentEnd, findAppointmentConflict } from '@/lib/calendar/appointments'
import { prisma } from '@/lib/prisma'

export interface AppointmentActionState {
  error?: string
  conflict?: {
    id: string
    clientName: string
    serviceTitle: string
    scheduledAt: string
  }
}

const serviceTypes: AppointmentServiceType[] = ['SOFA_RUG_CLEANING', 'WATERPROOFING', 'CAR_UPHOLSTERY', 'COMMUNITY_CLEANING', 'OTHER']
const statuses: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

function required(formData: FormData, name: string): string {
  const value = formData.get(name)
  if (typeof value !== 'string' || !value.trim()) throw new Error(`El campo ${name} es obligatorio`)
  return value.trim()
}

function optional(formData: FormData, name: string): string | null {
  const value = formData.get(name)
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function parseScheduledAt(formData: FormData): Date {
  const scheduledAt = new Date(`${required(formData, 'date')}T${required(formData, 'time')}:00`)
  if (Number.isNaN(scheduledAt.getTime())) throw new Error('La fecha y hora no son válidas')
  return scheduledAt
}

function parseDuration(formData: FormData): number {
  const duration = Number(required(formData, 'durationMinutes'))
  if (!Number.isInteger(duration) || duration < 15 || duration > 1440) {
    throw new Error('La duración debe estar entre 15 y 1440 minutos')
  }
  return duration
}

function parseServiceType(formData: FormData): AppointmentServiceType {
  const value = required(formData, 'serviceType') as AppointmentServiceType
  if (!serviceTypes.includes(value)) throw new Error('El servicio no es válido')
  return value
}

function parseStatus(formData: FormData): AppointmentStatus {
  const value = required(formData, 'status') as AppointmentStatus
  if (!statuses.includes(value)) throw new Error('El estado no es válido')
  return value
}

function parseOptionalValue(formData: FormData): string | null {
  const raw = optional(formData, 'value')
  if (!raw) return null
  const value = Number(raw.replace(',', '.'))
  if (!Number.isFinite(value) || value < 0) throw new Error('El valor no es válido')
  return value.toFixed(2)
}

async function getConflict(params: { scheduledAt: Date; durationMinutes: number; excludeId?: string }) {
  const end = getAppointmentEnd(params)
  const candidates = await prisma.appointment.findMany({
    where: {
      id: params.excludeId ? { not: params.excludeId } : undefined,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      scheduledAt: { lt: end },
    },
    select: {
      id: true,
      scheduledAt: true,
      durationMinutes: true,
      status: true,
      title: true,
      contact: { select: { name: true, company: true, phoneNumber: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })
  const conflict = findAppointmentConflict(params, candidates)
  return conflict ? candidates.find((candidate) => candidate.id === conflict.id) ?? null : null
}

function conflictState(conflict: NonNullable<Awaited<ReturnType<typeof getConflict>>>): AppointmentActionState {
  return {
    error: 'Ya existe un servicio programado en este horario.',
    conflict: {
      id: conflict.id,
      clientName: conflict.contact?.company || conflict.contact?.name || conflict.contact?.phoneNumber || 'Cliente sin asignar',
      serviceTitle: conflict.title,
      scheduledAt: conflict.scheduledAt.toISOString(),
    },
  }
}

function appointmentData(formData: FormData) {
  return {
    contactId: optional(formData, 'contactId'),
    dealId: optional(formData, 'dealId'),
    title: required(formData, 'title'),
    serviceType: parseServiceType(formData),
    scheduledAt: parseScheduledAt(formData),
    durationMinutes: parseDuration(formData),
    address: optional(formData, 'address'),
    municipality: optional(formData, 'municipality'),
    assignedToId: optional(formData, 'assignedToId'),
    value: parseOptionalValue(formData),
    currency: 'EUR',
    notes: optional(formData, 'notes'),
  }
}

function safeActionError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback
  const safePrefixes = ['El campo ', 'La fecha ', 'La duración ', 'El servicio ', 'El estado ', 'El valor ', 'La oportunidad ', 'El cliente ']
  return safePrefixes.some((prefix) => error.message.startsWith(prefix)) ? error.message : fallback
}

async function validateDealContact(dealId: string | null, contactId: string | null): Promise<void> {
  if (!dealId) return
  const deal = await prisma.deal.findUnique({ where: { id: dealId }, select: { contactId: true } })
  if (!deal) throw new Error('La oportunidad relacionada no existe')
  if (deal.contactId !== contactId) throw new Error('El cliente no coincide con la oportunidad seleccionada')
}

export async function createAppointmentAction(_state: AppointmentActionState, formData: FormData): Promise<AppointmentActionState> {
  let appointmentId: string
  try {
    const data = appointmentData(formData)
    await validateDealContact(data.dealId, data.contactId)
    const conflict = await getConflict(data)
    if (conflict && formData.get('forceOverlap') !== 'true') return conflictState(conflict)
    const appointment = await prisma.appointment.create({ data: { ...data, status: 'SCHEDULED' } })
    appointmentId = appointment.id
    revalidateAppointmentPaths(data.contactId, data.dealId)
  } catch (error: unknown) {
    return { error: safeActionError(error, 'No se pudo crear el servicio.') }
  }
  redirect(`/calendar/${appointmentId}`)
}

export async function updateAppointmentAction(_state: AppointmentActionState, formData: FormData): Promise<AppointmentActionState> {
  let appointmentId: string
  try {
    const id = required(formData, 'id')
    const data = appointmentData(formData)
    await validateDealContact(data.dealId, data.contactId)
    const conflict = await getConflict({ ...data, excludeId: id })
    if (conflict && formData.get('forceOverlap') !== 'true') return conflictState(conflict)
    await prisma.appointment.update({ where: { id }, data: { ...data, status: parseStatus(formData) } })
    appointmentId = id
    revalidateAppointmentPaths(data.contactId, data.dealId)
  } catch (error: unknown) {
    return { error: safeActionError(error, 'No se pudo actualizar el servicio.') }
  }
  redirect(`/calendar/${appointmentId}`)
}

export async function setAppointmentStatusAction(formData: FormData): Promise<void> {
  const id = required(formData, 'id')
  const status = parseStatus(formData)
  const appointment = await prisma.appointment.update({ where: { id }, data: { status }, select: { contactId: true, dealId: true } })
  revalidateAppointmentPaths(appointment.contactId, appointment.dealId)
  redirect(`/calendar/${id}`)
}

function revalidateAppointmentPaths(contactId: string | null, dealId: string | null): void {
  revalidatePath('/')
  revalidatePath('/calendar')
  if (contactId) revalidatePath(`/contacts/${contactId}`)
  if (dealId) revalidatePath(`/crm/${dealId}`)
}
