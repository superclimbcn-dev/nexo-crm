import { Briefcase, CheckCircle, Euro, MessageSquare, Users } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { formatCurrency } from '@/lib/utils'

interface AnalyticsDashboardProps {
  messagesToday: number
  totalContacts: number
  openDeals: number
  wonDeals: number
  pipelineValue: number
  leadsByService: Array<{ label: string; count: number }>
}

export function AnalyticsDashboard(props: AnalyticsDashboardProps) {
  const cards = [
    { label: 'Contactos', value: String(props.totalContacts), icon: Users },
    { label: 'Mensajes hoy', value: String(props.messagesToday), icon: MessageSquare },
    { label: 'Oportunidades abiertas', value: String(props.openDeals), icon: Briefcase },
    { label: 'Oportunidades ganadas', value: String(props.wonDeals), icon: CheckCircle },
    { label: 'Valor en pipeline', value: formatCurrency(props.pipelineValue, 'EUR'), icon: Euro },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Análisis</h1><p className="text-muted-foreground">Métricas reales de la operación de Superclim.</p></div>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {cards.map(({ label, value, icon: Icon }) => <article className="rounded-lg border border-border bg-card p-4" key={label}><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div><Icon className="h-5 w-5 text-primary" /></div><p className="mt-2 text-xs text-muted-foreground">Dato actual de la base de datos</p></article>)}
        </section>
        <section className="rounded-lg border border-border bg-card p-6"><h2 className="text-lg font-semibold">Leads por servicio</h2><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{props.leadsByService.map(item => <div className="rounded-lg border border-border p-4" key={item.label}><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-bold">{item.count}</p></div>)}</div></section>
        <section className="rounded-lg border border-dashed border-border bg-card p-6"><h2 className="font-semibold">Informes avanzados</h2><p className="mt-2 text-sm text-muted-foreground">Próximamente. No se muestran tasas, satisfacción ni rendimiento de agentes hasta disponer de datos verificables.</p></section>
      </div>
    </MainLayout>
  )
}
