'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { cn, formatDate, getRiskColor, getRiskBgColor } from '@/lib/utils'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Plus
} from 'lucide-react'
import { AddStudentModal } from '@/components/add-student-modal'
import { StudentDetailPanel } from '@/components/student-detail-panel'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Student {
  id: number
  name: string
  roll_no?: string
  department?: string
  attendance: number
  subject1_marks: number
  subject2_marks: number
  subject3_marks: number
  subject4_marks: number
  subject5_marks: number
  fees_pending: number
  risk_level: string
  confidence: number
  created_at: string
}

interface Alert {
  id: number
  student_id: number
  student_name: string
  risk_level: string
  reason: string
  created_at: string
  read: number
}

interface Analytics {
  risk_distribution: Record<string, number>
  total_students: number
  avg_attendance: number
  avg_marks: number
  avg_fees: number
  unread_alerts: number
  subject_averages?: {
    subject1: number
    subject2: number
    subject3: number
    subject4: number
    subject5: number
  }
}

const BASE_URL = "http://127.0.0.1:8000"

export function Dashboard() {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  
  const { data: studentsData, mutate: mutateStudents, error: studentsError } =
  useSWR<{ students: Student[] }>(`${BASE_URL}/students`, fetcher, {
    refreshInterval: 5000
  })

const { data: alertsData, mutate: mutateAlerts, error: alertsError } =
  useSWR<{ alerts: Alert[] }>(`${BASE_URL}/alerts?unread_only=true`, fetcher, {
    refreshInterval: 5000
  })

const { data: analytics, mutate: mutateAnalytics, error: analyticsError } =
  useSWR<Analytics>(`${BASE_URL}/analytics`, fetcher, {
    refreshInterval: 5000
  })

  const students = studentsData?.students || []
  const alerts = alertsData?.alerts || []
  const highRiskStudents = students.filter(s => s.risk_level === 'high')
  const recentStudents = students.slice(0, 5)

  // Show toast for new high risk alerts
  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[0]
      if (latestAlert.risk_level === 'high') {
        toast.error(`High Risk Alert: ${latestAlert.student_name}`, {
          description: latestAlert.reason,
          duration: 5000,
        })
      }
    }
  }, [alerts.length])

  const refreshAll = () => {
    mutateStudents()
    mutateAlerts()
    mutateAnalytics()
  }

  const deleteAllStudents = async () => {
    if (!confirm('Are you sure you want to delete ALL students? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`${BASE_URL}/students`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('All students deleted successfully')
        refreshAll()
      } else {
        toast.error('Failed to delete students')
      }
    } catch (error) {
      toast.error('Error deleting students')
    }
  }

  const stats = [
    {
      label: 'Total Students',
      value: analytics?.total_students ?? 0,
      icon: Users,
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'At Risk',
      value: (analytics?.risk_distribution?.high ?? 0) + (analytics?.risk_distribution?.medium ?? 0),
      icon: AlertTriangle,
      change: analytics?.risk_distribution?.high ? `${Math.round(((analytics.risk_distribution.high + (analytics.risk_distribution.medium ?? 0)) / (analytics.total_students ?? 1)) * 100)}%` : '0%',
      trend: 'down',
      highlight: true
    },
    {
      label: 'Avg Attendance',
      value: `${Math.round(analytics?.avg_attendance ?? 0)}%`,
      icon: Activity,
      change: '+2.4%',
      trend: 'up'
    },
    {
      label: 'Avg Marks',
      value: `${Math.round(analytics?.avg_marks ?? 0)}%`,
      icon: TrendingUp,
      change: '+5.1%',
      trend: 'up'
    }
  ]

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor student risk levels and take action</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/alerts')}
            className="relative p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-risk-high" />
            )}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={deleteAllStudents}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Delete All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </motion.button>
        </div>
      </div>

      {/* Stats Grid - Asymmetric */}
      <div className="grid grid-cols-12 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              if (stat.label === 'Total Students') {
                router.push('/students')
              } else if (stat.label === 'At Risk') {
                router.push('/alerts')
              }
            }}
            className={cn(
              'glass rounded-xl p-5 transition-all duration-300 hover:border-primary/30',
              (stat.label === 'Total Students' || stat.label === 'At Risk') && 'cursor-pointer hover:shadow-lg',
              index === 1 ? 'col-span-4' : 'col-span-3',
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
            <div className="flex items-center gap-1 mt-4 text-sm">
              {stat.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-risk-low" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-risk-high" />
              )}
              <span className={stat.trend === 'up' ? 'text-risk-low' : 'text-risk-high'}>
                {stat.change}
              </span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Live Risk Feed */}
        <div className="col-span-8 glass rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="text-lg font-medium text-foreground">Recent Students</h2>
            <p className="text-sm text-muted-foreground">Latest additions with risk assessment</p>
          </div>
          <div className="divide-y divide-border/50">
            <AnimatePresence mode="popLayout">
              {recentStudents.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No students yet. Add your first student to get started.</p>
                </div>
              ) : (
                recentStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      'flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-accent/50',
                      student.risk_level === 'high' && 'bg-risk-high/5'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                        getRiskBgColor(student.risk_level)
                      )}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Attendance: {student.attendance}% • Avg Marks: {
                            ((student.subject1_marks + student.subject2_marks + student.subject3_marks + student.subject4_marks + student.subject5_marks) / 5).toFixed(1)
                          }%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border',
                        getRiskBgColor(student.risk_level),
                        getRiskColor(student.risk_level)
                      )}>
                        {student.risk_level.charAt(0).toUpperCase() + student.risk_level.slice(1)} Risk
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(student.created_at)}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Alert Stream */}
        <div className="col-span-4 glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Alert Stream</h2>
              <p className="text-sm text-muted-foreground">{alerts.length} unread alerts</p>
            </div>
            {alerts.length > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-high" />
              </span>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {alerts.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-10 h-10 text-risk-low mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                </div>
              ) : (
                alerts.slice(0, 6).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-5 py-4 border-b border-border/30 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-risk-high/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-risk-high" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{alert.student_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.reason}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1.5">{formatDate(alert.created_at)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* High Risk Overview */}
        <div className="col-span-12 glass rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border/50">
            <h2 className="text-lg font-medium text-foreground">High Risk Students</h2>
            <p className="text-sm text-muted-foreground">Requires immediate attention</p>
          </div>
          <div className="p-6">
            {highRiskStudents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-risk-low mx-auto mb-4" />
                <p className="text-muted-foreground">No high risk students detected</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {highRiskStudents.slice(0, 4).map((student, index) => {
                  const avgMarks = (student.subject1_marks + student.subject2_marks + student.subject3_marks + student.subject4_marks + student.subject5_marks) / 5
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedStudent(student)}
                      className="p-4 rounded-xl border border-risk-high/30 bg-risk-high/5 cursor-pointer hover:bg-risk-high/10 transition-all duration-200 glow-high"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-risk-high/20 flex items-center justify-center text-sm font-medium text-risk-high">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-xs text-risk-high">{student.confidence}% confidence</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className="text-foreground">{student.attendance}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-risk-high transition-all"
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Marks</span>
                          <span className="text-foreground">{avgMarks.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-risk-medium transition-all"
                            style={{ width: `${Math.min(avgMarks, 100)}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshAll}
      />

      {/* Student Detail Panel */}
      <StudentDetailPanel
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onUpdate={refreshAll}
      />
    </div>
  )
}
