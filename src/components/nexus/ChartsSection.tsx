'use client'

import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { NexusChartData } from '@/types/nexus'

const tooltipStyle = {
  backgroundColor: '#161920',
  border: '1px solid #1c1f26',
  borderRadius: '12px',
  color: '#f8fafc',
}

interface ChartsSectionProps {
  conversionData: NexusChartData[]
  sourceData: NexusChartData[]
  pipelineData: NexusChartData[]
}

export function ChartsSection({
  conversionData,
  sourceData,
  pipelineData,
}: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="rounded-2xl border border-[#1c1f26] bg-[#161920] p-6"
      >
        <h3 className="text-xl font-semibold text-white">Taxa de Conversao por Mes</h3>
        <p className="mt-1 text-sm text-[#9fb0ca]">Ultimos 6 meses</p>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conversionData}>
              <defs>
                <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c1f26" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="url(#conversionGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-[#1c1f26] bg-[#161920] p-6"
      >
        <h3 className="text-xl font-semibold text-white">Distribuicao por Fonte</h3>
        <p className="mt-1 text-sm text-[#9fb0ca]">Total de leads por canal</p>
        <div className="mt-5 flex h-72 items-center">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie data={sourceData} dataKey="value" innerRadius={50} outerRadius={84} paddingAngle={4}>
                {sourceData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-40 space-y-3">
            {sourceData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-[#9fb0ca]">{item.name}</span>
                <span className="ml-auto text-sm text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="rounded-2xl border border-[#1c1f26] bg-[#161920] p-6 xl:col-span-2"
      >
        <h3 className="text-xl font-semibold text-white">Evolucao do Pipeline</h3>
        <p className="mt-1 text-sm text-[#9fb0ca]">Valor total em negociacao</p>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pipelineData}>
              <defs>
                <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c1f26" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
              <YAxis
                stroke="#64748b"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [`R$ ${(value / 1000000).toFixed(2)}M`, 'Valor']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#pipelineGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
