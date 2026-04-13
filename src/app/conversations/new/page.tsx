import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'

export default function NewConversationPage({
  searchParams,
}: {
  searchParams?: { contactId?: string }
}) {
  const contactId = searchParams?.contactId?.trim() ?? ''

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Crear conversación</h1>
        <p className="text-muted-foreground">
          Este contacto aún no tiene una conversación asociada. Próximamente podrás crearla desde
          esta vista.
        </p>
        {contactId ? (
          <p className="text-sm text-muted-foreground">Contacto seleccionado: {contactId}</p>
        ) : null}
        <Link className="text-sm font-medium text-primary hover:underline" href="/contacts">
          Volver a Contactos
        </Link>
      </div>
    </MainLayout>
  )
}
