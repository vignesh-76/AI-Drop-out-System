'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth-provider'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Analytics {
  risk_distribution: Record<string, number>
  total_students: number
  avg_attendance: number
  avg_marks: number
  avg_fees: number
  unread_alerts: number
}

interface Student {
  id: number
  name: string
  roll_no?: string
  department?: string
  attendance: number
  marks: number
  fees_pending: number
  risk_level: string
  confidence: number
  created_at: string
}

const COLORS = {
  high: 'oklch(0.65 0.25 25)',
  medium: 'oklch(0.80 0.16 80)',
  low: 'oklch(0.75 0.18 160)'
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { isLoading, mentor } = useAuthContext()

  // Redirect students from this page
  useEffect(() => {
    if (!isLoading && mentor && mentor.role === 'student') {
      toast.error('You do not have access to this page')
      router.push('/')
    }
  }, [isLoading, mentor, router])
  const BASE_URL = "http://127.0.0.1:8000";

  const { data: analytics } = useSWR<Analytics>(
    `${BASE_URL}/analytics`,
    fetcher,
    { refreshInterval: 5000 }
  )
const { data } = useSWR<{ students: Student[] }>(
  `${BASE_URL}/students`,
  fetcher
)
const students = data?.students || []

  // Prepare pie chart data
  const pieData = [
    { name: 'High Risk', value: analytics?.risk_distribution?.high || 0, color: COLORS.high },
    { name: 'Medium Risk', value: analytics?.risk_distribution?.medium || 0, color: COLORS.medium },
    { name: 'Low Risk', value: analytics?.risk_distribution?.low || 0, color: COLORS.low }
  ].filter(d => d.value > 0)

  // Prepare trend data (mock data based on students)
  const trendData = [
    { month: 'Jan', high: 2, medium: 5, low: 8 },
    { month: 'Feb', high: 3, medium: 4, low: 9 },
    { month: 'Mar', high: 4, medium: 6, low: 7 },
    { month: 'Apr', high: 2, medium: 8, low: 10 },
    { month: 'May', high: analytics?.risk_distribution?.high || 0, medium: analytics?.risk_distribution?.medium || 0, low: analytics?.risk_distribution?.low || 0 }
  ]
  

  // Prepare metrics distribution
  const attendanceDistribution = [
    { range: '0-50%', count: students.filter(s => s.attendance < 50).length },
    { range: '50-75%', count: students.filter(s => s.attendance >= 50 && s.attendance < 75).length },
    { range: '75-90%', count: students.filter(s => s.attendance >= 75 && s.attendance < 90).length },
    { range: '90-100%', count: students.filter(s => s.attendance >= 90).length }
  ]

  const marksDistribution = [
    { range: '0-40%', count: students.filter(s => s.marks < 40).length },
    { range: '40-60%', count: students.filter(s => s.marks >= 40 && s.marks < 60).length },
    { range: '60-80%', count: students.filter(s => s.marks >= 60 && s.marks < 80).length },
    { range: '80-100%', count: students.filter(s => s.marks >= 80).length }
  ]

  const stats = [
    {
      label: 'Total Students',
      value: analytics?.total_students || 0,
      icon: Users,
      change: '+12%',
      trend: 'up',
      description: 'Total enrolled students'
    },
    {
      label: 'At High Risk',
      value: analytics?.risk_distribution?.high || 0,
      icon: AlertTriangle,
      change: analytics?.risk_distribution?.high 
        ? `${Math.round((analytics.risk_distribution.high / (analytics.total_students || 1)) * 100)}%` 
        : '0%',
      trend: 'down',
      highlight: true,
      description: 'Need immediate attention'
    },
    {
      label: 'Avg Attendance',
      value: `${analytics?.avg_attendance || 0}%`,
      icon: Activity,
      change: '+2.4%',
      trend: 'up',
      description: 'Overall attendance rate'
    },
    {
      label: 'Avg Marks',
      value: `${analytics?.avg_marks || 0}%`,
      icon: TrendingUp,
      change: '+5.1%',
      trend: 'up',
      description: 'Average academic performance'
    }
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg p-3 border border-border">
          <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} students ({Math.round((payload[0].value / (analytics?.total_students || 1)) * 100)}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
      <main className="pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor trends and patterns across your student base
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'glass rounded-xl p-5',
                  stat.highlight && 'border-risk-high/30'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={cn(
                      'text-3xl font-semibold mt-2',
                      stat.highlight ? 'text-risk-high' : 'text-foreground'
                    )}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn(
                    'p-2.5 rounded-lg',
                    stat.highlight ? 'bg-risk-high/10' : 'bg-primary/10'
                  )}>
                    <stat.icon className={cn(
                      'w-5 h-5',
                      stat.highlight ? 'text-risk-high' : 'text-primary'
                    )} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{stat.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Risk Distribution Donut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-4 glass rounded-xl p-6"
            >
              <h3 className="text-lg font-medium text-foreground mb-2">Risk Distribution</h3>
              <p className="text-sm text-muted-foreground mb-6">Current risk level breakdown</p>
              
              {pieData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No data available</p>
                </div>
              ) : (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex justify-center gap-6 mt-4">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Risk Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-8 glass rounded-xl p-6"
            >
              <h3 className="text-lg font-medium text-foreground mb-2">Risk Trends</h3>
              <p className="text-sm text-muted-foreground mb-6">Monthly risk level changes</p>
              
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.14 0.01 260)',
                        border: '1px solid oklch(0.25 0.01 260)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'oklch(0.98 0 0)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="high"
                      stroke={COLORS.high}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="medium"
                      stroke={COLORS.medium}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="low"
                      stroke={COLORS.low}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.high }} />
                  <span className="text-xs text-muted-foreground">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.medium }} />
                  <span className="text-xs text-muted-foreground">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.low }} />
                  <span className="text-xs text-muted-foreground">Low Risk</span>
                </div>
              </div>
            </motion.div>

            {/* Attendance Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-6 glass rounded-xl p-6"
            >
              <h3 className="text-lg font-medium text-foreground mb-2">Attendance Distribution</h3>
              <p className="text-sm text-muted-foreground mb-6">Students by attendance range</p>
              
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceDistribution}>
                    <XAxis
                      dataKey="range"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.14 0.01 260)',
                        border: '1px solid oklch(0.25 0.01 260)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'oklch(0.98 0 0)' }}
                    />
                    <Bar
                      dataKey="count"
                      fill={COLORS.low}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Marks Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="col-span-6 glass rounded-xl p-6"
            >
              <h3 className="text-lg font-medium text-foreground mb-2">Marks Distribution</h3>
              <p className="text-sm text-muted-foreground mb-6">Students by marks range</p>
              
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marksDistribution}>
                    <XAxis
                      dataKey="range"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.14 0.01 260)',
                        border: '1px solid oklch(0.25 0.01 260)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'oklch(0.98 0 0)' }}
                    />
                    <Bar
                      dataKey="count"
                      fill={COLORS.medium}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
