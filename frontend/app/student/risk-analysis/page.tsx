'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Sidebar } from '@/components/sidebar'
import { AlertCircle, TrendingUp, TrendingDown, Target, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react'

const fetcher = async (url: string) => {
  const token = localStorage.getItem('access_token')
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function StudentRiskAnalysisPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('student_id')
    if (!id) {
      router.push('/student-login')
    } else {
      setStudentId(id)
    }
  }, [router])

  const { data: profileData, isLoading } = useSWR(
    studentId ? `http://127.0.0.1:8000/auth/student/profile` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', badge: 'bg-red-500/30' }
      case 'MEDIUM':
        return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', badge: 'bg-yellow-500/30' }
      default:
        return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', badge: 'bg-green-500/30' }
    }
  }

  const recommendations = [
    {
      title: 'Improve Attendance',
      description: 'Your attendance is below the recommended threshold of 75%. Focus on regular class participation.',
      severity: 'high',
      icon: AlertTriangle,
      actions: ['Attend all classes', 'Inform in case of medical emergencies', 'Make up missed classes']
    },
    {
      title: 'Strengthen Your Academics',
      description: 'Review challenging concepts and seek help from instructors.',
      severity: 'medium',
      icon: BookOpen,
      actions: ['Join study groups', 'Consult with mentors', 'Practice more problems']
    },
    {
      title: 'Complete Fee Payments',
      description: 'Ensure all fee payments are up to date to avoid registration issues.',
      severity: 'high',
      icon: AlertCircle,
      actions: ['Contact accounts office', 'Set up payment plan', 'Submit fee slip']
    }
  ]

  if (!studentId || isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
          <div className="text-center">
            <motion.div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </motion.div>
            <p className="text-slate-400 mt-4">Loading risk analysis...</p>
          </div>
        </div>
      </div>
    )
  }

  const riskColor = getRiskColor(profileData?.risk_level || 'LOW')

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Risk Analysis</h1>
            <p className="text-slate-400">Understand your academic risk factors</p>
          </motion.div>

          {/* Main Risk Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-8 border backdrop-blur-xl ${riskColor.bg} ${riskColor.border}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Current Risk Assessment</p>
                <p className={`text-4xl font-bold ${riskColor.text}`}>{profileData?.risk_level}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${riskColor.badge}`}>
                  <Target className="w-5 h-5" />
                  <span className="text-sm font-medium">Confidence: {(profileData?.confidence || 0).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profileData?.risk_factors?.map((factor, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm font-medium capitalize">{factor.factor}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      factor.severity === 'high' ? 'bg-red-500/30 text-red-400' :
                      factor.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-400' :
                      'bg-green-500/30 text-green-400'
                    }`}>
                      {factor.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white font-semibold">{factor.value.toFixed(1)}</p>
                  <p className="text-slate-500 text-xs mt-1">Threshold: {factor.threshold.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Risk Factors Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Marks Factor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Academic Performance</span>
                {profileData?.average_marks >= 60 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-2">{profileData?.average_marks.toFixed(1)}/100</p>
              <p className="text-slate-400 text-sm">
                {profileData?.average_marks >= 60
                  ? 'Performing well in academics'
                  : profileData?.average_marks >= 40
                  ? 'Need improvement in academics'
                  : 'Critical: Immediate action needed'}
              </p>
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${profileData?.average_marks >= 60 ? 'bg-green-500' : profileData?.average_marks >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((profileData?.average_marks || 0) / 100 * 100, 100)}%` }}
                />
              </div>
            </motion.div>

            {/* Attendance Factor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Attendance Record</span>
                {profileData?.attendance >= 75 ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : profileData?.attendance >= 60 ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-2">{profileData?.attendance.toFixed(1)}%</p>
              <p className="text-slate-400 text-sm">
                {profileData?.attendance >= 75
                  ? 'Excellent attendance'
                  : profileData?.attendance >= 60
                  ? 'Needs improvement'
                  : 'Critical: Risk of cancellation'}
              </p>
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${profileData?.attendance >= 75 ? 'bg-green-500' : profileData?.attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((profileData?.attendance || 0) / 100 * 100, 100)}%` }}
                />
              </div>
            </motion.div>

            {/* Fees Factor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Fee Status</span>
                {profileData?.fees_pending === 0 ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-2">₹{profileData?.fees_pending.toFixed(0)}</p>
              <p className="text-slate-400 text-sm">
                {profileData?.fees_pending === 0
                  ? 'All fees cleared'
                  : 'Pending fees need attention'}
              </p>
              <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${profileData?.fees_pending === 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: profileData?.fees_pending === 0 ? '100%' : '30%' }}
                />
              </div>
            </motion.div>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Recommendations</h2>
            {recommendations.map((rec, idx) => {
              const Icon = rec.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-xl p-6 border backdrop-blur-xl ${
                    rec.severity === 'high'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${rec.severity === 'high' ? 'bg-red-500/20' : 'bg-yellow-500/20'} flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${rec.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{rec.title}</h3>
                      <p className="text-slate-400 text-sm mb-4">{rec.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {rec.actions.map((action, aIdx) => (
                          <span
                            key={aIdx}
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              rec.severity === 'high'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
