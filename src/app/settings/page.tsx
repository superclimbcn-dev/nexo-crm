import { MainLayout } from '@/components/layout/MainLayout'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Esta sección estará disponible próximamente para gestionar ajustes globales del CRM.
        </p>
      </div>
    </MainLayout>
  )
}
