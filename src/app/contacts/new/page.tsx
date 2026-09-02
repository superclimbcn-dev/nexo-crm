import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createContactAction } from '../actions'

export default function NewContactPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Nuevo Contacto</h1><p className="text-muted-foreground">Añade un contacto a la base real del CRM.</p></div>
          <Button asChild variant="outline"><Link href="/contacts"><ArrowLeft className="mr-2 h-4 w-4" />Volver</Link></Button>
        </div>
        <form action={createContactAction} className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
          <Field label="Nombre" name="name" />
          <Field label="Teléfono" name="phoneNumber" required />
          <Field label="Email" name="email" type="email" />
          <Field label="Empresa / comunidad" name="company" />
          <Field label="Origen" name="source" placeholder="manual, recomendación…" />
          <div className="flex items-end justify-end md:col-span-2"><Button type="submit"><Save className="mr-2 h-4 w-4" />Guardar contacto</Button></div>
        </form>
      </div>
    </MainLayout>
  )
}

function Field({ label, name, required = false, type = 'text', placeholder }: { label: string; name: string; required?: boolean; type?: string; placeholder?: string }) {
  return <div className="space-y-2"><label className="text-sm font-medium" htmlFor={name}>{label}</label><Input id={name} name={name} placeholder={placeholder} required={required} type={type} /></div>
}
