import { MainLayout } from '@/components/layout/MainLayout'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Configuración operativa actual. Las credenciales de WhatsApp se mantienen de forma segura en variables de entorno.
        </p>
        <div className="grid max-w-3xl gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Empresa</p><p className="mt-1 font-semibold">Superclim Servicios</p></div>
          <div className="rounded-lg border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Idioma</p><p className="mt-1 font-semibold">Español</p></div>
          <div className="rounded-lg border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Moneda</p><p className="mt-1 font-semibold">EUR (€)</p></div>
        </div>
      </div>
    </MainLayout>
  )
}
