'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressItem {
  label: string
  value: number
  target: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'purple'
}

export function ProgressTracking({ items }: { items: ProgressItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, idx) => {
        const percentage = Math.min((item.value / item.target) * 100, 100)
        const isGood = percentage >= 75
        const isMedium = percentage >= 50
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-xs text-purple-300">{item.value} / {item.target}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isGood ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  isGood ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  isMedium ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                  'bg-gradient-to-r from-red-400 to-red-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>

            {/* Status Text */}
            <p className="text-xs text-purple-300 mt-3">
              {isGood ? '✓ On track' : isMedium ? '⚠ Keep going' : '✗ Needs focus'}
            </p>
          </motion.div>
        )
      })}
    </div>
  )
}

export function StudyPlanWidget() {
  const studySessions = [
    { subject: 'Mathematics', time: '2:00 PM', duration: '1.5 hrs', priority: 'high' },
    { subject: 'Physics', time: '4:00 PM', duration: '1 hr', priority: 'medium' },
    { subject: 'Chemistry', time: '6:00 PM', duration: '1 hr', priority: 'medium' }
  ]

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-400" />
        Today's Study Plan
      </h3>

      <div className="space-y-3">
        {studySessions.map((session, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border transition-all',
              session.priority === 'high'
                ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                : 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
            )}
          >
            <div>
              <p className="text-white font-medium text-sm">{session.subject}</p>
              <p className="text-xs text-purple-300">{session.time} • {session.duration}</p>
            </div>
            <Zap className={cn(
              'w-4 h-4',
              session.priority === 'high' ? 'text-red-400' : 'text-amber-400'
            )} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function PeerComparison({ yourScore, classAverage, position, total }: any) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Class Position</h3>

      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30"
        >
          <p className="text-3xl font-bold text-purple-400">{yourScore}</p>
          <p className="text-xs text-purple-300 mt-1">Your Score</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
        >
          <p className="text-3xl font-bold text-blue-400">{classAverage}</p>
          <p className="text-xs text-blue-300 mt-1">Class Avg</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30"
        >
          <p className="text-3xl font-bold text-green-400">{position}/{total}</p>
          <p className="text-xs text-green-300 mt-1">Rank</p>
        </motion.div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <p className="text-sm text-white">
          {yourScore > classAverage 
            ? '🎉 You\'re performing above average!'
            : '💪 Keep pushing, you\'re close to the average!'}
        </p>
      </div>
    </div>
  )
}

export function NotificationCenter({ notifications }: { notifications: any[] }) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-purple-300 text-center py-4">✓ All caught up!</p>
        ) : (
          notifications.map((notif, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <p className="text-white text-sm font-medium">{notif.title}</p>
              <p className="text-xs text-purple-300 mt-1">{notif.message}</p>
              <p className="text-xs text-purple-400 mt-1">{notif.time}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
