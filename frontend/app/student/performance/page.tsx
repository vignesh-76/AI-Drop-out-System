'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Sidebar } from '@/components/sidebar'
import { TrendingUp, TrendingDown, Target, Zap, AlertCircle } from 'lucide-react'

const fetcher = async (url: string) => {
  const token = localStorage.getItem('access_token')
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default function StudentPerformancePage() {
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

  // Mock data for trends - in real app, this would come from backend
  const attendanceTrend = [
    { week: 'Week 1', value: 70 },
    { week: 'Week 2', value: 72 },
    { week: 'Week 3', value: 78 },
    { week: 'Week 4', value: 75 },
    { week: 'Week 5', value: 80 },
    { week: 'Week 6', value: 82 },
    { week: 'Week 7', value: 85 },
  ]

  const marksTrend = [
    { week: 'Week 1', value: 65 },
    { week: 'Week 2', value: 68 },
    { week: 'Week 3', value: 72 },
    { week: 'Week 4', value: 70 },
    { week: 'Week 5', value: 75 },
    { week: 'Week 6', value: 78 },
    { week: 'Week 7', value: 80 },
  ]

  const subjectData = profileData ? [
    { name: 'Subject 1', value: profileData.subject1_marks, fullMark: 100 },
    { name: 'Subject 2', value: profileData.subject2_marks, fullMark: 100 },
    { name: 'Subject 3', value: profileData.subject3_marks, fullMark: 100 },
    { name: 'Subject 4', value: profileData.subject4_marks, fullMark: 100 },
    { name: 'Subject 5', value: profileData.subject5_marks, fullMark: 100 },
  ] : []

  if (!studentId || isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
          <div className="text-center">
            <motion.div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </motion.div>
            <p className="text-slate-400 mt-4">Loading your performance data...</p>
          </div>
        </div>
      </div>
    )
  }

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
            <h1 className="text-4xl font-bold text-white mb-2">Your Performance</h1>
            <p className="text-slate-400">Track your academic progress over time</p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {/* Average Marks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Average Marks</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{profileData?.average_marks.toFixed(1)}</p>
              <p className="text-slate-400 text-xs mt-2">of 100</p>
            </motion.div>

            {/* Attendance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Attendance</span>
                {profileData?.attendance >= 75 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <p className="text-3xl font-bold text-white">{profileData?.attendance.toFixed(1)}%</p>
              <p className="text-slate-400 text-xs mt-2">{profileData?.attendance >= 75 ? 'Good standing' : 'Needs improvement'}</p>
            </motion.div>

            {/* Fees Pending */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Fees Pending</span>
                {profileData?.fees_pending === 0 ? (
                  <Zap className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className="text-3xl font-bold text-white">{profileData?.fees_pending === 0 ? '₹0' : `₹${profileData?.fees_pending}`}</p>
              <p className="text-slate-400 text-xs mt-2">{profileData?.fees_pending === 0 ? 'All cleared' : 'Due'}</p>
            </motion.div>

            {/* Risk Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-xl p-6 border backdrop-blur-xl ${
                profileData?.risk_level === 'LOW'
                  ? 'bg-green-500/20 border-green-500/30'
                  : profileData?.risk_level === 'MEDIUM'
                  ? 'bg-yellow-500/20 border-yellow-500/30'
                  : 'bg-red-500/20 border-red-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Risk Level</span>
                <Target className="w-5 h-5 text-white" />
              </div>
              <p className={`text-3xl font-bold ${
                profileData?.risk_level === 'LOW'
                  ? 'text-green-400'
                  : profileData?.risk_level === 'MEDIUM'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {profileData?.risk_level}
              </p>
              <p className="text-slate-400 text-xs mt-2">Score: {(profileData?.confidence || 0).toFixed(0)}</p>
            </motion.div>
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Attendance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#00d9ff" strokeWidth={3} dot={{ fill: '#00d9ff' }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Marks Trend */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Marks Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marksTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Subject Performance */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Subject Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={subjectData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                  <Radar name="Marks" dataKey="value" stroke="#00d9ff" fill="#00d9ff" fillOpacity={0.6} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: 'white' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Bar Chart - Subject Comparison */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Subject Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
