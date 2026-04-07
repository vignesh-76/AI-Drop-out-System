'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Sidebar } from '@/components/sidebar'
import { Award, Star, Lock, Zap, Trophy, Target, BookOpen, TrendingUp, Users } from 'lucide-react'

const fetcher = async (url: string) => {
  const token = localStorage.getItem('access_token')
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: any
  unlocked: boolean
  unlockedDate?: string
  progress?: number
  requirement: string
}

export default function StudentAchievementsPage() {
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

  const { data: profileData } = useSWR(
    studentId ? `http://127.0.0.1:8000/auth/student/profile` : null,
    fetcher,
    { refreshInterval: 5000 }
  )

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Perfect Attendance',
      description: 'Maintain 100% attendance for a semester',
      icon: Trophy,
      unlocked: profileData?.attendance === 100,
      progress: profileData?.attendance || 0,
      requirement: '100% attendance'
    },
    {
      id: '2',
      name: 'Excellent Scholar',
      description: 'Score above 90 in all subjects',
      icon: Star,
      unlocked: profileData && profileData.subject1_marks > 90 && profileData.subject2_marks > 90 && 
                profileData.subject3_marks > 90 && profileData.subject4_marks > 90 && profileData.subject5_marks > 90,
      progress: profileData ? (profileData.subject1_marks + profileData.subject2_marks + profileData.subject3_marks + 
                              profileData.subject4_marks + profileData.subject5_marks) / 5 : 0,
      requirement: '90+ average marks'
    },
    {
      id: '3',
      name: 'Zero Risk',
      description: 'Maintain a LOW risk level throughout the semester',
      icon: Zap,
      unlocked: profileData?.risk_level === 'LOW',
      requirement: 'LOW risk status'
    },
    {
      id: '4',
      name: 'Finance Master',
      description: 'Keep all fees paid up-to-date',
      icon: Target,
      unlocked: profileData?.fees_pending === 0,
      requirement: '₹0 fees pending'
    },
    {
      id: '5',
      name: 'Consistent Learner',
      description: 'Maintain marks above 75 throughout',
      icon: BookOpen,
      unlocked: profileData && profileData.subject1_marks > 75 && profileData.subject2_marks > 75 && 
                profileData.subject3_marks > 75 && profileData.subject4_marks > 75 && profileData.subject5_marks > 75,
      progress: profileData ? (profileData.subject1_marks + profileData.subject2_marks + profileData.subject3_marks + 
                              profileData.subject4_marks + profileData.subject5_marks) / 5 : 0,
      requirement: '75+ average marks'
    },
    {
      id: '6',
      name: 'Rising Star',
      description: 'Improve marks by 10+ points in a semester',
      icon: TrendingUp,
      unlocked: false,
      progress: 65,
      requirement: '+10 improvement'
    }
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalPoints = unlockedCount * 100

  if (!studentId) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
            <p className="text-slate-400 mt-4">Loading achievements...</p>
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
            <h1 className="text-4xl font-bold text-white mb-2">Achievements</h1>
            <p className="text-slate-400">Unlock achievements and track your progress</p>
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
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Total Points</span>
                <Award className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{totalPoints}</p>
              <p className="text-slate-400 text-xs mt-2">From achievements</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl p-6 border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Unlocked</span>
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{unlockedCount}/{achievements.length}</p>
              <p className="text-slate-400 text-xs mt-2">Achievements</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">Completion</span>
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
              <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, idx) => {
              const Icon = achievement.icon
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl p-6 border backdrop-blur-xl transition-all duration-300 ${
                    achievement.unlocked
                      ? 'bg-white/10 border-white/20 cursor-pointer hover:bg-white/20'
                      : 'bg-slate-900/50 border-slate-700/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      achievement.unlocked
                        ? 'bg-yellow-500/30'
                        : 'bg-slate-700/50'
                    }`}>
                      {achievement.unlocked ? (
                        <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-yellow-400' : 'text-slate-500'}`} />
                      ) : (
                        <Lock className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    {achievement.unlocked && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/30 text-green-400">
                        UNLOCKED
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 ${achievement.unlocked ? 'text-white' : 'text-slate-400'}`}>
                    {achievement.name}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                    {achievement.description}
                  </p>

                  {achievement.progress !== undefined && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Progress</span>
                        <span className={achievement.unlocked ? 'text-green-400 font-semibold' : 'text-slate-400'}>
                          {achievement.progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            achievement.unlocked
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    {achievement.requirement}
                  </p>

                  {achievement.unlockedDate && (
                    <p className="text-xs text-green-400 mt-3">
                      Unlocked: {achievement.unlockedDate}
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Achievement Leaderboard Teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">🏆 Your Rank</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-2">Your Position in Class</p>
                <p className="text-4xl font-bold text-white">5th</p>
                <p className="text-slate-400 text-sm mt-2">Out of 45 students</p>
              </div>
              <Users className="w-16 h-16 text-blue-400 opacity-50" />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
