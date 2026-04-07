'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Award,
  Target,
  Calendar,
  Clock,
  MessageSquare,
  Zap,
  Heart,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  Users
} from 'lucide-react'
import { cn, getRiskColor, getRiskBgColor } from '@/lib/utils'

interface StudentData {
  id: number
  name: string
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

interface RiskEvaluation {
  risk_level: string
  confidence_score: number
  individual_risks: Array<{
    factor: string
    risk: string
    value: number
    reason: string
  }>
  critical_factors: string[]
}

const subjects = [
  { name: 'Mathematics', key: 'subject1_marks' },
  { name: 'Physics', key: 'subject2_marks' },
  { name: 'Chemistry', key: 'subject3_marks' },
  { name: 'English', key: 'subject4_marks' },
  { name: 'CS/Economics', key: 'subject5_marks' }
]

export function StudentDashboard({ student }: { student: StudentData | null }) {
  const [riskEval, setRiskEval] = useState<RiskEvaluation | null>(null)
  const [averageMarks, setAverageMarks] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (student) {
      calculateMetrics()
      fetchRiskEvaluation()
    }
  }, [student?.id])

  const calculateMetrics = () => {
    if (!student) return
    const marks = [
      student.subject1_marks,
      student.subject2_marks,
      student.subject3_marks,
      student.subject4_marks,
      student.subject5_marks
    ].filter(m => m > 0)
    const avg = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0
    setAverageMarks(avg)
  }

  const fetchRiskEvaluation = async () => {
    if (!student) return
    try {
      const response = await fetch(`http://127.0.0.1:8000/students/${student.id}/risk-evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance_percentage: student.attendance,
          average_marks: averageMarks || getAverageMarks(),
          fees_pending_percentage: student.fees_pending
        })
      })
      if (response.ok) {
        const data = await response.json()
        setRiskEval(data)
      }
    } catch (error) {
      console.error('Failed to fetch risk evaluation:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAverageMarks = () => {
    if (!student) return 0
    const marks = [
      student.subject1_marks,
      student.subject2_marks,
      student.subject3_marks,
      student.subject4_marks,
      student.subject5_marks
    ].filter(m => m > 0)
    return marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Select a student to view their dashboard</p>
      </div>
    )
  }

  const avg = averageMarks || getAverageMarks()
  const marksProgress = Math.min(avg, 100)
  const attendanceProgress = Math.min(student.attendance, 100)
  const feeStatus = student.fees_pending === 0 ? 'Paid' : student.fees_pending === 100 ? 'Pending' : `${100 - Math.round(student.fees_pending)}% Paid`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome, {student.name}! 👋</h1>
            <p className="text-purple-200">Your personalized learning dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-300">Academic Year 2024-25</p>
            <p className="text-2xl font-bold text-white mt-1">Semester 1</p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Health Score Card - Big */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 md:col-span-4"
        >
          <div className="glass-gradient rounded-2xl p-8 border border-white/20 backdrop-blur-md relative overflow-hidden group">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Academic Health Score</h3>
                <Heart className="w-5 h-5 text-red-400" />
              </div>

              {/* Circular Progress */}
              <div className="relative w-40 h-40 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    opacity="0.2"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={avg >= 75 ? '#10b981' : avg >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 * (1 - avg / 100) }}
                    strokeDasharray="440"
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">{Math.round(avg)}</p>
                    <p className="text-sm text-purple-300">/100</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <p className="text-white font-medium mb-1">
                  {avg >= 75 ? '✨ Excellent' : avg >= 60 ? '⚡ Good' : '⚠️ Needs Attention'}
                </p>
                <p className="text-sm text-purple-300">
                  {avg >= 75 ? 'Keep up the great work!' : avg >= 60 ? 'Some improvement needed' : 'Focus on weak areas'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats - Trio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 md:col-span-4"
        >
          <div className="space-y-4">
            {/* Attendance */}
            <div className="glass rounded-xl p-6 border border-white/10 hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Attendance
                </h4>
                <span className="text-2xl font-bold text-blue-400">{student.attendance}%</span>
              </div>
              <div className="w-full bg-blue-500/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(student.attendance, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-purple-300 mt-2">
                {student.attendance >= 75 ? '✓ Good attendance' : student.attendance >= 60 ? '⚠ Maintain attendance' : '✗ Low attendance - increase soon'}
              </p>
            </div>

            {/* Fees */}
            <div className="glass rounded-xl p-6 border border-white/10 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Fee Status
                </h4>
                <span className="text-2xl font-bold text-amber-400">{feeStatus}</span>
              </div>
              <div className="w-full bg-amber-500/20 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(100 - student.fees_pending, 0)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-purple-300 mt-2">
                {student.fees_pending === 0 ? '✓ All fees cleared' : student.fees_pending === 100 ? '⚠ Complete payment pending' : '⚡ Payment in progress'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Risk Assessment Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 md:col-span-4"
        >
          <div className={cn(
            'rounded-2xl p-8 border backdrop-blur-md relative overflow-hidden',
            student.risk_level === 'high'
              ? 'bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent border-red-500/30'
              : student.risk_level === 'medium'
              ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/30'
              : 'bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/30'
          )}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Risk Assessment</h3>
                {student.risk_level === 'high' && <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />}
                {student.risk_level === 'medium' && <Lightbulb className="w-6 h-6 text-amber-400" />}
                {student.risk_level === 'low' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
              </div>

              <div className="mb-6">
                <p className={cn(
                  'text-4xl font-bold mb-2',
                  student.risk_level === 'high' ? 'text-red-400' : student.risk_level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                )}>
                  {student.risk_level?.toUpperCase()}
                </p>
                <p className="text-purple-300 text-sm">Confidence: {Math.round(student.confidence)}%</p>
              </div>

              {riskEval && riskEval.individual_risks && (
                <div className="space-y-3">
                  {riskEval.individual_risks.map((risk, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        risk.risk === 'HIGH' ? 'bg-red-400' : risk.risk === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                      )} />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium capitalize">{risk.factor}</p>
                        <p className="text-xs text-purple-300">{risk.reason}</p>
                      </div>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-1 rounded',
                        risk.risk === 'HIGH' ? 'bg-red-500/20 text-red-300' : risk.risk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      )}>
                        {risk.risk}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subject Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-md mb-8"
      >
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Subject Performance
          </h3>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {subjects.map((subject, idx) => {
            const marks = student[subject.key as keyof StudentData] as number
            const percentage = (marks / 100) * 100
            return (
              <motion.div
                key={subject.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="group"
              >
                <div className="glass rounded-xl p-4 border border-white/10 group-hover:border-purple-500/50 transition-all cursor-pointer h-full flex flex-col justify-between">
                  <div>
                    <p className="text-white font-medium text-sm mb-4">{subject.name}</p>
                    <div className="mb-4">
                      <svg className="w-24 h-24 mx-auto transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="6"
                          opacity="0.1"
                        />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="none"
                          stroke={marks >= 75 ? '#10b981' : marks >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="6"
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 251 }}
                          animate={{ strokeDashoffset: 251 * (1 - percentage / 100) }}
                          strokeDasharray="251"
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center mt-6">
                        <p className="text-lg font-bold text-white">{marks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-purple-300 font-medium">
                      {marks >= 75 ? '⭐ Excellent' : marks >= 60 ? '✓ Good' : '✗ Needs Work'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Action Items & Recommendations */}
      <div className="grid grid-cols-12 gap-6">
        {/* Things to Do */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-12 md:col-span-6"
        >
          <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              <Target className="w-6 h-6 text-blue-400" />
              Action Items
            </h3>

            <div className="space-y-3">
              {student.attendance < 75 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                >
                  <input type="checkbox" className="mt-1 w-4 h-4 cursor-pointer" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Improve Attendance</p>
                    <p className="text-sm text-blue-300">Current: {student.attendance}% - Aim for 75%+</p>
                  </div>
                </motion.div>
              )}

              {avg < 60 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                  <input type="checkbox" className="mt-1 w-4 h-4 cursor-pointer" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Boost Academics</p>
                    <p className="text-sm text-amber-300">Average: {Math.round(avg)}% - Need extra study sessions</p>
                  </div>
                </motion.div>
              )}

              {student.fees_pending > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
                >
                  <input type="checkbox" className="mt-1 w-4 h-4 cursor-pointer" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Complete Fee Payment</p>
                    <p className="text-sm text-red-300">Pending: {student.fees_pending.toFixed(1)}% - Pay from accounts office</p>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30"
              >
                <input type="checkbox" className="mt-1 w-4 h-4 cursor-pointer" />
                <div className="flex-1">
                  <p className="text-white font-medium">Join Study Group</p>
                  <p className="text-sm text-purple-300">Connect with 4+ classmates in Physics</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tips & Resources */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-12 md:col-span-6"
        >
          <div className="glass rounded-2xl p-8 border border-white/20 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              Study Tips
            </h3>

            <div className="space-y-3">
              {[
                {
                  icon: '📚',
                  title: 'Daily Review',
                  desc: '30 mins daily review of class notes',
                  color: 'blue'
                },
                {
                  icon: '⏰',
                  title: 'Time Management',
                  desc: 'Use Pomodoro: 25min focus + 5min break',
                  color: 'green'
                },
                {
                  icon: '👥',
                  title: 'Peer Learning',
                  desc: 'Study with classmates weekly',
                  color: 'purple'
                },
                {
                  icon: '🎯',
                  title: 'Set Goals',
                  desc: 'Break into weekly milestones',
                  color: 'amber'
                }
              ].map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  <span className="text-xl">{tip.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{tip.title}</p>
                    <p className="text-xs text-purple-300">{tip.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Achievements & Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 glass rounded-2xl p-8 border border-white/20 backdrop-blur-md"
      >
        <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-yellow-400" />
          Achievements & Badges
        </h3>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { emoji: '🌟', label: 'Attendance Star', unlocked: student.attendance >= 90 },
            { emoji: '🎯', label: 'High Scorer', unlocked: avg >= 80 },
            { emoji: '📈', label: 'Rising Star', unlocked: avg >= 70 },
            { emoji: '💯', label: 'Perfect Subject', unlocked: Object.values(student).some(v => v === 100) },
            { emoji: '🏆', label: 'All-Rounder', unlocked: avg >= 70 && student.attendance >= 75 },
            { emoji: '💪', label: 'Consistent', unlocked: avg >= 60 }
          ].map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + idx * 0.1 }}
              className={cn(
                'flex flex-col items-center justify-center p-6 rounded-xl border backdrop-blur-sm transition-all',
                badge.unlocked
                  ? 'bg-yellow-500/20 border-yellow-500/30 cursor-pointer hover:scale-110'
                  : 'bg-white/5 border-white/10 opacity-50'
              )}
            >
              <span className="text-4xl mb-2">{badge.emoji}</span>
              <p className="text-xs text-white text-center font-medium">{badge.label}</p>
              {!badge.unlocked && <p className="text-xs text-purple-300 mt-1">🔒 Locked</p>}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
