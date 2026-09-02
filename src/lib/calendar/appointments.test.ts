import assert from 'node:assert/strict'
import test from 'node:test'
import { createAppointmentDraft, findAppointmentConflict, getAppointmentEnd, transitionAppointmentStatus } from './appointments'

const at = (hour: number) => new Date(2026, 8, 2, hour, 0, 0)
const candidate = (start: number, durationMinutes = 120, status: 'SCHEDULED' | 'CANCELLED' = 'SCHEDULED') => ({ id: String(start), scheduledAt: at(start), durationMinutes, status })

test('crea un appointment relacionado a Contact', () => {
  const result = createAppointmentDraft({ title: 'Sofá', contactId: 'contact-1', scheduledAt: at(10), durationMinutes: 120 })
  assert.equal(result.contactId, 'contact-1')
  assert.equal(result.status, 'SCHEDULED')
})

test('calcula el final del intervalo', () => assert.equal(getAppointmentEnd(candidate(10)).getTime(), at(12).getTime()))
test('detecta conflicto exacto', () => assert.equal(findAppointmentConflict(candidate(10), [candidate(10)])?.id, '10'))
test('detecta conflicto parcial', () => assert.equal(findAppointmentConflict(candidate(10), [candidate(11)])?.id, '11'))
test('un servicio anterior no genera conflicto', () => assert.equal(findAppointmentConflict(candidate(12), [candidate(10)]), null))
test('un servicio posterior no genera conflicto', () => assert.equal(findAppointmentConflict(candidate(10), [candidate(12)]), null))
test('CANCELLED no bloquea el horario', () => assert.equal(findAppointmentConflict(candidate(10), [candidate(11, 120, 'CANCELLED')]), null))
test('permite representar una edición de fecha y duración', () => {
  const edited = { ...candidate(10), scheduledAt: at(14), durationMinutes: 90 }
  assert.equal(edited.scheduledAt.getHours(), 14)
  assert.equal(edited.durationMinutes, 90)
})
test('permite marcar un appointment como COMPLETED', () => assert.equal(transitionAppointmentStatus('CONFIRMED', 'COMPLETED').status, 'COMPLETED'))
