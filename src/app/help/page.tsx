import { MainLayout } from '@/components/layout/MainLayout'

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Ayuda</h1>
        <p className="text-muted-foreground">
          Aquí mostraremos documentación operativa, preguntas frecuentes y guías del equipo.
        </p>
      </div>
    </MainLayout>
  )
}
