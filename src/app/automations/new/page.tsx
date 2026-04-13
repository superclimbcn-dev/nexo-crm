import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'

export default function NewAutomationPage() {
  return (
    <MainLayout>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Nueva Automatización</h1>
            <p className="text-muted-foreground">
              Estamos preparando el formulario completo para crear flujos automáticos desde la UI.
            </p>
          </div>

          <Link href="/automations">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        <section className="rounded-2xl border border-dashed border-border bg-card p-8">
          <div className="flex flex-col items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Editor en preparación</h2>
              <p className="text-sm text-muted-foreground">
                La siguiente fase conectará la creación de automatizaciones con Prisma y permitirá
                definir disparadores, condiciones y respuestas sin salir del CRM.
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
