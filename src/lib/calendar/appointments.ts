export const ACTIVE_APPOINTMENT_STATUSES = ['SCHEDULED', 'CONFIRMED'] as const

export const APPOINTMENT_SERVICE_LABELS = {
  SOFA_RUG_CLEANING: 'Limpieza de sofá / alfombra',
  WATERPROOFING: 'Impermeabilización',
  CAR_UPHOLSTERY: 'Tapicería de coche',
  COMMUNITY_CLEANING: 'Limpieza de comunidades',
  OTHER: 'Otro',
} as const

export const APPOINTMENT_STATUS_LABELS = {
  SCHEDULED: 'Programado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
} as const

export type AppointmentInterval = {
  scheduledAt: Date
  durationMinutes: number
}

export type AppointmentConflictCandidate = AppointmentInterval & {
  id: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}

export function getAppointmentEnd(interval: AppointmentInterval): Date {
  return new Date(interval.scheduledAt.getTime() + interval.durationMinutes * 60_000)
}

export function intervalsOverlap(first: AppointmentInterval, second: AppointmentInterval): boolean {
  return first.scheduledAt < getAppointmentEnd(second) && second.scheduledAt < getAppointmentEnd(first)
}

export function findAppointmentConflict(
  proposed: AppointmentInterval,
  candidates: AppointmentConflictCandidate[],
): AppointmentConflictCandidate | null {
  return candidates.find((candidate) =>
    candidate.status !== 'CANCELLED' &&
    candidate.status !== 'COMPLETED' &&
    intervalsOverlap(proposed, candidate),
  ) ?? null
}

export function createAppointmentDraft(params: AppointmentInterval & { title: string; contactId?: string | null }) {
  if (!params.title.trim()) throw new Error('El título es obligatorio')
  if (!Number.isInteger(params.durationMinutes) || params.durationMinutes <= 0) {
    throw new Error('La duración debe ser mayor que cero')
  }
  return { ...params, title: params.title.trim(), contactId: params.contactId ?? null, status: 'SCHEDULED' as const }
}

export function transitionAppointmentStatus(
  current: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
  next: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
) {
  return { previousStatus: current, status: next }
}
