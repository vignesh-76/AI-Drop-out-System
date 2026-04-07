'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Sidebar } from '@/components/sidebar'
import { BookOpen, Clock, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react'

const fetcher = async (url: string) => {
  const token = localStorage.getItem('access_token')
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

interface StudySession {
  id: string
  subject: string
  topic: string
  duration: number
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  scheduled_time: string
}

export default function StudentStudyPlanPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: '1',
      subject: 'Mathematics',
      topic: 'Calculus - Integration',
      duration: 90,
      priority: 'high',
      completed: false,
      scheduled_time: '2024-01-10 10:00 AM'
    },
    {
      id: '2',
      subject: 'Physics',
      topic: 'Quantum Mechanics Basics',
      duration: 60,
      priority: 'medium',
      completed: false,
      scheduled_time: '2024-01-10 2:00 PM'
    },
    {
      id: '3',
      subject: 'Chemistry',
      topic: 'Organic Chemistry Reactions',
      duration: 75,
      priority: 'high',
      completed: false,
      scheduled_time: '2024-01-11 9:00 AM'
    },
    {
      id: '4',
      subject: 'English',
      topic: 'Literature Analysis',
      duration: 45,
      priority: 'low',
      completed: true,
      scheduled_time: '2024-01-09 5:00 PM'
    }
  ])

  const [showNewSession, setShowNewSession] = useState(false)
  const [newSession, setNewSession] = useState({
    subject: '',
    topic: '',
    duration: 60,
    priority: 'medium' as const
  })

  useEffect(() => {
    const id = localStorage.getItem('student_id')
    if (!id) {
      router.push('/student-login')
    } else {
      setStudentId(id)
    }
  }, [router])

  const { data: profileData } = useSWR(
    studentId ? `http://127.0.0.1:8000/auth/student/profile` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const handleAddSession = () => {
    if (newSession.subject && newSession.topic) {
      const session: StudySession = {
        id: Date.now().toString(),
        ...newSession,
        completed: false,
        scheduled_time: new Date().toLocaleString()
      }
      setSessions([...sessions, session])
      setNewSession({ subject: '', topic: '', duration: 60, priority: 'medium' })
      setShowNewSession(false)
    }
  }

  const handleDelete = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id))
  }

  const handleToggleComplete = (id: string) => {
    setSessions(sessions.map(s =>
      s.id === id ? { ...s, completed: !s.completed } : s
    ))
  }

  const completedCount = sessions.filter(s => s.completed).length
  const totalDuration = sessions.reduce((sum, s) => sum + (s.completed ? 0 : s.duration), 0)

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
            <h1 className="text-4xl font-bold text-white mb-2">Study Plan</h1>
            <p className="text-slate-400">Organize your learning schedule</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Total Sessions</span>
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{sessions.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Completed</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{completedCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Time Remaining</span>
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-white">{totalDuration}</p>
              <p className="text-slate-400 text-xs mt-2">minutes</p>
            </motion.div>
          </motion.div>

          {/* Add New Session Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowNewSession(!showNewSession)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add Study Session
          </motion.button>

          {/* New Session Form */}
          {showNewSession && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-semibold text-white mb-4">New Study Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newSession.subject}
                  onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                <input
                  type="text"
                  placeholder="Topic"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                <select
                  value={newSession.priority}
                  onChange={(e) => setNewSession({ ...newSession, priority: e.target.value as any })}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddSession}
                  className="px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  Add Session
                </button>
                <button
                  onClick={() => setShowNewSession(false)}
                  className="px-6 py-2 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Study Sessions List */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Your Sessions</h2>
            {sessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-xl p-6 border backdrop-blur-xl flex items-center justify-between ${
                  session.completed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/10 border-white/20'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => handleToggleComplete(session.id)}
                    className="flex-shrink-0"
                  >
                    {session.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-400 hover:border-blue-400 transition-colors" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${session.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                      {session.subject} - {session.topic}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.duration} mins
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.priority === 'high'
                          ? 'bg-red-500/30 text-red-400'
                          : session.priority === 'medium'
                          ? 'bg-yellow-500/30 text-yellow-400'
                          : 'bg-blue-500/30 text-blue-400'
                      }`}>
                        {session.priority.toUpperCase()}
                      </span>
                      <span>{session.scheduled_time}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
