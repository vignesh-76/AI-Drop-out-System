'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ComposedChart
} from 'recharts'
import { Sidebar } from '@/components/sidebar'
import { Users, TrendingUp, AlertCircle, BarChart3, Award } from 'lucide-react'

const fetcher = async (url: string) => {
  const token = localStorage.getItem('access_token')
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444']
const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444'
}

export default function MentorAnalyticsPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('user_role')
    if (role !== 'mentor') {
      router.push('/login')
    } else {
      setUserRole(role)
    }
  }, [router])

  const { data: studentsData } = useSWR(
    userRole === 'mentor' ? 'http://127.0.0.1:8000/students' : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const { data: analyticsData } = useSWR(
    userRole === 'mentor' ? 'http://127.0.0.1:8000/analytics' : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  // Process data
  const students = studentsData?.students || []
  
  // Risk distribution
  const riskDistribution = [
    { name: 'LOW', value: students.filter(s => s.risk_level === 'LOW').length, fill: '#10b981' },
    { name: 'MEDIUM', value: students.filter(s => s.risk_level === 'MEDIUM').length, fill: '#f59e0b' },
    { name: 'HIGH', value: students.filter(s => s.risk_level === 'HIGH').length, fill: '#ef4444' }
  ]

  // Attendance distribution
  const attendanceDistribution = [
    { range: '90-100%', count: students.filter(s => s.attendance >= 90).length },
    { range: '75-89%', count: students.filter(s => s.attendance >= 75 && s.attendance < 90).length },
    { range: '60-74%', count: students.filter(s => s.attendance >= 60 && s.attendance < 75).length },
    { range: 'Below 60%', count: students.filter(s => s.attendance < 60).length }
  ]

  // Marks distribution
  const marksDistribution = [
    { range: '90-100', count: students.filter(s => (s.subject1_marks + s.subject2_marks + s.subject3_marks + s.subject4_marks + s.subject5_marks) / 5 >= 90).length },
    { range: '75-89', count: students.filter(s => {
      const avg = (s.subject1_marks + s.subject2_marks + s.subject3_marks + s.subject4_marks + s.subject5_marks) / 5
      return avg >= 75 && avg < 90
    }).length },
    { range: '60-74', count: students.filter(s => {
      const avg = (s.subject1_marks + s.subject2_marks + s.subject3_marks + s.subject4_marks + s.subject5_marks) / 5
      return avg >= 60 && avg < 75
    }).length },
    { range: 'Below 60', count: students.filter(s => {
      const avg = (s.subject1_marks + s.subject2_marks + s.subject3_marks + s.subject4_marks + s.subject5_marks) / 5
      return avg < 60
    }).length }
  ]

  // Top performers
  const topPerformers = students
    .map(s => ({
      ...s,
      avgMarks: (s.subject1_marks + s.subject2_marks + s.subject3_marks + s.subject4_marks + s.subject5_marks) / 5
    }))
    .sort((a, b) => b.avgMarks - a.avgMarks)
    .slice(0, 5)

  // Students needing attention
  const needingAttention = students
    .filter(s => s.risk_level === 'HIGH' || s.attendance < 60)
    .slice(0, 5)

  // Average metrics
  const avgAttendance = students.length > 0
    ? (students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1)
    : 0

  const avgMarks = students.length > 0
    ? (students.reduce((sum, s) => sum + (s.subject1_marks + s.subject2_marks + s.subject3_marks + s.subject4_marks + s.subject5_marks) / 5, 0) / students.length).toFixed(1)
    : 0

  if (!userRole) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
            <p className="text-slate-400 mt-4">Loading analytics...</p>
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
            <h1 className="text-4xl font-bold text-white mb-2">Mentor Analytics</h1>
            <p className="text-slate-400">Comprehensive insights into student performance and risk factors</p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {/* Total Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Total Students</span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{students.length}</p>
              <p className="text-slate-400 text-xs mt-2">Under monitoring</p>
            </motion.div>

            {/* Average Attendance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Avg Attendance</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{avgAttendance}%</p>
              <p className="text-slate-400 text-xs mt-2">Class participation</p>
            </motion.div>

            {/* Average Marks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Avg Marks</span>
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{avgMarks}</p>
              <p className="text-slate-400 text-xs mt-2">of 100</p>
            </motion.div>

            {/* At Risk */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-red-500/20 backdrop-blur-xl rounded-xl p-6 border border-red-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">At Risk</span>
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-400">
                {students.filter(s => s.risk_level === 'HIGH').length}
              </p>
              <p className="text-slate-400 text-xs mt-2">High Risk Students</p>
            </motion.div>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Pie Chart */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Attendance Distribution */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Attendance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Marks Distribution */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Marks Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marksDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: 'white' }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Attendance vs Marks Scatter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6">Attendance vs Marks</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="attendance" name="Attendance" stroke="rgba(255,255,255,0.5)" />
                  <YAxis dataKey="avgMarks" name="Average Marks" stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: 'white' }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter name="Students" data={students.map(s => ({
                    ...s,
                    avgMarks: (s.subject1_marks + s.subject2_marks + s.subject3_marks + s.subject4_marks + s.subject5_marks) / 5
                  }))} fill="#00d9ff" />
                </ScatterChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Top Performers & Needs Attention */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-400" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {topPerformers.map((student, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                  >
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-slate-400 text-sm">{student.roll_no || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{student.avgMarks.toFixed(1)}</p>
                      <p className="text-slate-400 text-xs">avg marks</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Needs Attention */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Needs Attention
              </h3>
              <div className="space-y-3">
                {needingAttention.map((student, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      student.risk_level === 'HIGH'
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-yellow-500/10 border-yellow-500/20'
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-slate-400 text-sm">{student.roll_no || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.risk_level === 'HIGH'
                          ? 'bg-red-500/30 text-red-400'
                          : 'bg-yellow-500/30 text-yellow-400'
                      }`}>
                        {student.risk_level}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
