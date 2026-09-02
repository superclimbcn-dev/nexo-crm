import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageSquare, Save } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { prisma } from '@/lib/prisma'
import { addContactNoteAction, updateContactAction } from '../actions'

export default async function ContactDetailPage({ params }: { params: { id: string } }) {
  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: { tags: true, notes: { orderBy: { createdAt: 'desc' } }, conversations: { orderBy: { lastMessageAt: 'desc' }, take: 1 } },
  })
  if (!contact) notFound()
  const conversation = contact.conversations[0]

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Detalle del contacto</h1><p className="text-muted-foreground">Información comercial e historial.</p></div><Button asChild variant="outline"><Link href="/contacts"><ArrowLeft className="mr-2 h-4 w-4" />Contactos</Link></Button></div>
        <form action={updateContactAction} className="grid gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
          <input name="id" type="hidden" value={contact.id} />
          <EditField defaultValue={contact.name ?? ''} label="Nombre" name="name" />
          <EditField defaultValue={contact.phoneNumber} label="Teléfono" name="phoneNumber" required />
          <EditField defaultValue={contact.email ?? ''} label="Email" name="email" type="email" />
          <EditField defaultValue={contact.company ?? ''} label="Empresa / comunidad" name="company" />
          <EditField defaultValue={contact.source ?? ''} label="Origen" name="source" />
          <div className="space-y-2"><p className="text-sm font-medium">Etiquetas</p><div className="flex min-h-10 flex-wrap items-center gap-2">{contact.tags.length ? contact.tags.map(tag => <Badge key={tag.id} variant="outline">{tag.name}</Badge>) : <span className="text-sm text-muted-foreground">Sin etiquetas</span>}</div></div>
          <div className="flex justify-end gap-2 md:col-span-2">{conversation ? <Button asChild variant="outline"><Link href={`/conversations/${conversation.id}`}><MessageSquare className="mr-2 h-4 w-4" />Abrir conversación</Link></Button> : null}<Button type="submit"><Save className="mr-2 h-4 w-4" />Guardar cambios</Button></div>
        </form>
        <section className="rounded-2xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Notas e historial</h2><form action={addContactNoteAction} className="mt-4 flex gap-2"><input name="contactId" type="hidden" value={contact.id} /><Input name="content" placeholder="Añadir una nota comercial…" required /><Button type="submit">Añadir</Button></form><div className="mt-5 space-y-3">{contact.notes.length ? contact.notes.map(note => <article className="rounded-lg border border-border p-3" key={note.id}><p className="text-sm">{note.content}</p><p className="mt-1 text-xs text-muted-foreground">{note.createdAt.toLocaleString('es-ES')}</p></article>) : <p className="text-sm text-muted-foreground">Sin notas todavía.</p>}</div></section>
      </div>
    </MainLayout>
  )
}

function EditField({ defaultValue, label, name, required = false, type = 'text' }: { defaultValue: string; label: string; name: string; required?: boolean; type?: string }) {
  return <div className="space-y-2"><label className="text-sm font-medium" htmlFor={name}>{label}</label><Input defaultValue={defaultValue} id={name} name={name} required={required} type={type} /></div>
}
