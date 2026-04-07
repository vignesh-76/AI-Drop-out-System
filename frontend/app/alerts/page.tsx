'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth-provider'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import { cn, formatDate, getRiskColor } from '@/lib/utils'
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Filter,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Alert {
  id: number
  student_id: number
  student_name: string
  risk_level: string
  reason: string
  created_at: string
  read: number
}

export default function AlertsPage() {
  const router = useRouter()
  const { isLoading, mentor } = useAuthContext()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  
  // Redirect students from this page
  useEffect(() => {
    if (!isLoading && mentor && mentor.role === 'student') {
      toast.error('You do not have access to this page')
      router.push('/')
    }
  }, [isLoading, mentor, router])
  
  const BASE_URL = "http://127.0.0.1:8000";

const { data, mutate } = useSWR<{ alerts: Alert[] }>(
  filter === 'unread'
    ? `${BASE_URL}/alerts?unread_only=true`
    : `${BASE_URL}/alerts`,
  fetcher,
  { refreshInterval: 3000 }
)

  const alerts = data?.alerts || []
  const unreadCount = alerts.filter(a => !a.read).length

  const markAsRead = async (alertId: number) => {
  try {
    await fetch(`${BASE_URL}/alerts/${alertId}/read`, { method: 'PUT' })
    mutate()
  } catch (error) {
    toast.error('Failed to mark alert as read')
  }
}

const markAllAsRead = async () => {
  try {
    await fetch(`${BASE_URL}/alerts/read-all`, { method: 'PUT' })
    toast.success('All alerts marked as read')
    mutate()
  } catch (error) {
    toast.error('Failed to mark alerts as read')
  }
}

  const groupAlertsByDate = (alerts: Alert[]) => {
    const groups: { [key: string]: Alert[] } = {}
    
    alerts.forEach(alert => {
      const date = new Date(alert.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let key: string
      if (date.toDateString() === today.toDateString()) {
        key = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday'
      } else {
        key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(alert)
    })
    
    return groups
  }

  const groupedAlerts = groupAlertsByDate(alerts)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
        <div className="p-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-risk-high/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-risk-high" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-risk-high text-xs font-medium text-foreground flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Alert Stream</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'all'
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === 'unread'
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-high opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-high" />
              </span>
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-risk-high/20 text-risk-high text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Alert Timeline */}
          {alerts.length === 0 ? (
            <div className="glass rounded-xl p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-risk-low/10 flex items-center justify-center mx-auto mb-4">
                <BellOff className="w-8 h-8 text-risk-low" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No alerts</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread'
                  ? 'All alerts have been read'
                  : 'No high-risk students detected yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedAlerts).map(([date, dateAlerts]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {date}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {dateAlerts.map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            'glass rounded-xl p-5 transition-all duration-300',
                            !alert.read && 'border-risk-high/30 bg-risk-high/5'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                              alert.risk_level === 'high'
                                ? 'bg-risk-high/20'
                                : alert.risk_level === 'medium'
                                ? 'bg-risk-medium/20'
                                : 'bg-risk-low/20'
                            )}>
                              <AlertTriangle className={cn(
                                'w-5 h-5',
                                getRiskColor(alert.risk_level)
                              )} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-foreground">{alert.student_name}</h3>
                                    {!alert.read && (
                                      <span className="px-2 py-0.5 rounded-full bg-risk-high/20 text-risk-high text-xs font-medium">
                                        New
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{alert.reason}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    'px-2.5 py-1 rounded-full text-xs font-medium',
                                    alert.risk_level === 'high'
                                      ? 'bg-risk-high/20 text-risk-high'
                                      : alert.risk_level === 'medium'
                                      ? 'bg-risk-medium/20 text-risk-medium'
                                      : 'bg-risk-low/20 text-risk-low'
                                  )}>
                                    {alert.risk_level.charAt(0).toUpperCase() + alert.risk_level.slice(1)} Risk
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDate(alert.created_at)}
                                </div>
                                
                                {!alert.read && (
                                  <button
                                    onClick={() => markAsRead(alert.id)}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
