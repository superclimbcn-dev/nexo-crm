'use client'

import Link from 'next/link'
import { useFormState } from 'react-dom'
import { AlertTriangle, Save } from 'lucide-react'
import type { AppointmentActionState } from '@/app/calendar/actions'
import { APPOINTMENT_SERVICE_LABELS, APPOINTMENT_STATUS_LABELS } from '@/lib/calendar/appointments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Option = { id: string; label: string }
type FormValues = {
  id?: string; contactId?: string; dealId?: string; title?: string; serviceType?: keyof typeof APPOINTMENT_SERVICE_LABELS
  date?: string; time?: string; durationMinutes?: number; address?: string; municipality?: string
  assignedToId?: string; value?: string; notes?: string; status?: keyof typeof APPOINTMENT_STATUS_LABELS
}

export function AppointmentForm({ action, contacts, users, initial = {}, showStatus = false }: {
  action: (state: AppointmentActionState, formData: FormData) => Promise<AppointmentActionState>
  contacts: Option[]; users: Option[]; initial?: FormValues; showStatus?: boolean
}) {
  const [state, formAction] = useFormState(action, {})
  return (
    <form action={formAction} className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
      {initial.id ? <input name="id" type="hidden" value={initial.id} /> : null}
      {initial.dealId ? <input name="dealId" type="hidden" value={initial.dealId} /> : null}
      <Select label="Cliente" name="contactId" defaultValue={initial.contactId ?? ''} options={contacts} emptyLabel="Sin cliente asignado" />
      <Select label="Servicio" name="serviceType" defaultValue={initial.serviceType ?? 'SOFA_RUG_CLEANING'} options={Object.entries(APPOINTMENT_SERVICE_LABELS).map(([id, label]) => ({ id, label }))} required />
      <Field label="Título" name="title" defaultValue={initial.title ?? ''} required />
      <Field label="Fecha" name="date" defaultValue={initial.date ?? ''} required type="date" />
      <Field label="Hora" name="time" defaultValue={initial.time ?? ''} required type="time" />
      <div className="space-y-2"><label className="text-sm font-medium" htmlFor="durationMinutes">Duración (minutos)</label><Input defaultValue={String(initial.durationMinutes ?? 120)} id="durationMinutes" list="duration-options" max="1440" min="15" name="durationMinutes" required step="15" type="number" /><datalist id="duration-options"><option value="60" /><option value="90" /><option value="120" /><option value="180" /></datalist></div>
      <Field label="Dirección" name="address" defaultValue={initial.address ?? ''} />
      <Field label="Municipio" name="municipality" defaultValue={initial.municipality ?? ''} />
      <Select label="Responsable" name="assignedToId" defaultValue={initial.assignedToId ?? ''} options={users} emptyLabel="Sin asignar" />
      <Field label="Precio / valor (€)" name="value" defaultValue={initial.value ?? ''} min="0" step="0.01" type="number" />
      {showStatus ? <Select label="Estado" name="status" defaultValue={initial.status ?? 'SCHEDULED'} options={Object.entries(APPOINTMENT_STATUS_LABELS).map(([id, label]) => ({ id, label }))} required /> : null}
      <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium" htmlFor="notes">Observaciones</label><textarea className="min-h-28 w-full rounded-md border border-border bg-background p-3 text-sm" defaultValue={initial.notes ?? ''} id="notes" name="notes" placeholder="Segundo piso sin ascensor, llamar antes…" /></div>
      {state.error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm md:col-span-2"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" /><div><p className="font-semibold text-red-500">{state.error}</p>{state.conflict ? <p className="mt-2">{state.conflict.clientName} · {state.conflict.serviceTitle} · {new Date(state.conflict.scheduledAt).toLocaleString('es-ES')}</p> : null}</div></div>{state.conflict ? <label className="mt-4 flex items-center gap-2 font-medium"><input name="forceOverlap" type="checkbox" value="true" />Guardar de todos modos</label> : null}</div> : null}
      <div className="flex justify-end gap-2 md:col-span-2"><Button asChild variant="outline"><Link href="/calendar">Cancelar</Link></Button><Button type="submit"><Save className="mr-2 h-4 w-4" />{state.conflict ? 'Confirmar y guardar' : 'Guardar servicio'}</Button></div>
    </form>
  )
}

function Field(props: { label: string; name: string; defaultValue: string; required?: boolean; type?: string; min?: string; step?: string }) { const { label, ...inputProps } = props; return <div className="space-y-2"><label className="text-sm font-medium" htmlFor={props.name}>{label}</label><Input id={props.name} {...inputProps} /></div> }
function Select({ label, name, options, defaultValue, emptyLabel, required = false }: { label: string; name: string; options: Option[]; defaultValue: string; emptyLabel?: string; required?: boolean }) { return <div className="space-y-2"><label className="text-sm font-medium" htmlFor={name}>{label}</label><select className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" defaultValue={defaultValue} id={name} name={name} required={required}>{emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}{options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></div> }
