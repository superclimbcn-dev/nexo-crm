import { FileText } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'

export default function TemplatesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Plantillas</h1><p className="text-muted-foreground">Plantillas de WhatsApp Business.</p></div>
        <section className="rounded-2xl border border-dashed border-border bg-card p-8">
          <div className="flex max-w-2xl flex-col items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary"><FileText className="h-6 w-6" /></div>
            <div><h2 className="text-xl font-semibold">Integración en preparación</h2><p className="mt-2 text-sm text-muted-foreground">La gestión de plantillas desde el CRM estará disponible próximamente. No se muestran ni se guardan plantillas simuladas.</p></div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
