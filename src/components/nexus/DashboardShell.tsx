'use client'

import { useState } from 'react'
import { ActivityFeed } from '@/components/nexus/ActivityFeed'
import { ChartsSection } from '@/components/nexus/ChartsSection'
import { Header } from '@/components/nexus/Header'
import { KanbanBoard } from '@/components/nexus/KanbanBoard'
import { LeadsTable } from '@/components/nexus/LeadsTable'
import { Sidebar } from '@/components/nexus/Sidebar'
import { StatsGrid } from '@/components/nexus/StatsGrid'
import {
  activitiesData,
  conversionChartData,
  currentUser,
  leadsData,
  notificationsData,
  pipelineData,
  pipelineValueData,
  sourceChartData,
  statsData,
} from '@/lib/nexus/mock'

export function DashboardShell() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#0f1115]">
      <Sidebar
        user={currentUser}
        activeItem="dashboard"
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((current) => !current)}
      />
      <Header
        user={currentUser}
        notifications={notificationsData}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <main
        className="min-h-screen px-6 pb-8 pt-24 transition-all"
        style={{ marginLeft: isSidebarCollapsed ? 80 : 260 }}
      >
        <div className="space-y-6">
          <StatsGrid stats={statsData} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <LeadsTable leads={leadsData} />
            </div>
            <div className="xl:col-span-1">
              <ActivityFeed activities={activitiesData} />
            </div>
          </div>

          <KanbanBoard columns={pipelineData} />

          <ChartsSection
            conversionData={conversionChartData}
            sourceData={sourceChartData}
            pipelineData={pipelineValueData}
          />
        </div>
      </main>
    </div>
  )
}
