import Link from 'next/link'
import { DealStage, Prisma } from '@prisma/client'
import { ArrowLeft, Briefcase, Save } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PROJECT_CURRENCY } from '@/lib/pricing/sabadell'
import { prisma } from '@/lib/prisma'
import { createDealAction } from '../actions'

const contactsQuery = Prisma.validator<Prisma.ContactFindManyArgs>()({
  select: {
    id: true,
    name: true,
    phoneNumber: true,
    company: true,
  },
  orderBy: {
    updatedAt: 'desc',
  },
})

function getContactDisplayName(contact: Prisma.ContactGetPayload<typeof contactsQuery>): string {
  return contact.name?.trim() || contact.phoneNumber
}

const selectableStages: Array<{ value: DealStage; label: string }> = [
  { value: 'NEW', label: 'Nuevo' },
  { value: 'QUALIFIED', label: 'Calificado' },
  { value: 'PROPOSAL', label: 'Propuesta' },
  { value: 'NEGOTIATION', label: 'Negociación' },
  { value: 'CLOSED_WON', label: 'Ganado' },
  { value: 'CLOSED_LOST', label: 'Perdido' },
]

export default async function NewDealPage() {
  const contacts = await prisma.contact.findMany(contactsQuery)

  return (
    <MainLayout>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nueva Oportunidad</h1>
            <p className="text-muted-foreground">
              Crea un deal real en la base de datos y añádelo al pipeline comercial.
            </p>
          </div>

          <Link href="/crm">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Pipeline
            </Button>
          </Link>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Formulario de oportunidad</h2>
              <p className="text-sm text-muted-foreground">
                Los campos guardan directamente en la tabla `Deal`.
              </p>
            </div>
          </div>

          <form action={createDealAction} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="contactId">
                  Contacto
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  id="contactId"
                  name="contactId"
                  required
                >
                  <option value="">Selecciona un contacto</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {getContactDisplayName(contact)}
                      {contact.company ? ` · ${contact.company}` : ''}
                      {` · ${contact.phoneNumber}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="title">
                  Título
                </label>
                <Input id="title" name="title" placeholder="Ej. Servicio premium de impermeabilización" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="value">
                  Valor ({PROJECT_CURRENCY === 'EUR' ? '€' : PROJECT_CURRENCY})
                </label>
                <Input id="value" min="0" name="value" placeholder="265.00" step="0.01" type="number" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="probability">
                  Probabilidad
                </label>
                <Input
                  id="probability"
                  max="100"
                  min="0"
                  name="probability"
                  placeholder="50"
                  step="1"
                  type="number"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="stage">
                  Etapa
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  defaultValue="NEW"
                  id="stage"
                  name="stage"
                  required
                >
                  {selectableStages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="expectedClose">
                  Cierre estimado
                </label>
                <Input id="expectedClose" name="expectedClose" type="date" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium" htmlFor="source">
                  Origen
                </label>
                <Input id="source" name="source" placeholder="WhatsApp, campaña, recomendación..." />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium" htmlFor="notes">
                  Notas
                </label>
                <textarea
                  className="min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  id="notes"
                  name="notes"
                  placeholder="Contexto comercial, alcance del servicio, detalles del presupuesto..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Guardar oportunidad
              </Button>
            </div>
          </form>
        </section>
      </div>
    </MainLayout>
  )
}
