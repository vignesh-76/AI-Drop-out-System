'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth-provider'
import { toast } from 'sonner'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import { AddStudentModal } from '@/components/add-student-modal'
import { StudentDetailPanel } from '@/components/student-detail-panel'
import { cn, getRiskColor, getRiskBgColor, formatDate } from '@/lib/utils'
import {
  Search,
  Filter,
  Plus,
  Users,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

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

export default function StudentsPage() {
  const router = useRouter()
  const { isLoading, mentor } = useAuthContext()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [showFilters, setShowFilters] = useState(false)

  // Redirect students from this page
  useEffect(() => {
    if (!isLoading && mentor && mentor.role === 'student') {
      toast.error('You do not have access to this page')
      router.push('/')
    }
  }, [isLoading, mentor, router])

  const BASE_URL = "http://127.0.0.1:8000";

const { data, mutate } = useSWR<{ students: Student[] }>(
  `${BASE_URL}/students`,
  fetcher,
  { refreshInterval: 5000 }
)

const students = data?.students || [];

  const riskCounts = {
    all: students.length,
    high: students.filter(s => s.risk_level === 'high').length,
    medium: students.filter(s => s.risk_level === 'medium').length,
    low: students.filter(s => s.risk_level === 'low').length
  }

  // Filter students based on search and risk level
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (student.roll_no?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesRisk = riskFilter === 'all' || student.risk_level === riskFilter
    return matchesSearch && matchesRisk
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Students</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {students.length} students enrolled
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-4 h-10 rounded-lg border text-sm font-medium transition-colors',
                  showFilters
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-foreground border-border hover:bg-accent'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
              </button>

              {/* View Toggle */}
              <div className="flex items-center rounded-lg border border-border p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'cards' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">Risk Level:</span>
                    {['all', 'high', 'medium', 'low'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setRiskFilter(filter)}
                        className={cn(
                          'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                          riskFilter === filter
                            ? filter === 'high'
                              ? 'bg-risk-high/20 text-risk-high border border-risk-high/30'
                              : filter === 'medium'
                              ? 'bg-risk-medium/20 text-risk-medium border border-risk-medium/30'
                              : filter === 'low'
                              ? 'bg-risk-low/20 text-risk-low border border-risk-low/30'
                              : 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-accent text-muted-foreground hover:text-foreground border border-transparent'
                        )}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        <span className="ml-1.5 opacity-70">
                          ({filter === 'all' ? students.length : riskCounts[filter as keyof typeof riskCounts]})
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Students Grid/List */}
          {filteredStudents.length === 0 ? (
            <div className="glass rounded-xl p-16 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery || riskFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first student'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      'glass rounded-xl p-5 cursor-pointer transition-all duration-300 hover:border-primary/30',
                      student.risk_level === 'high' && 'border-risk-high/30 glow-high'
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold',
                          getRiskBgColor(student.risk_level)
                        )}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{student.name}</h3>
                          <p className="text-xs text-muted-foreground">{formatDate(student.created_at)}</p>
                        </div>
                      </div>
                      <div className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium border',
                        getRiskBgColor(student.risk_level),
                        getRiskColor(student.risk_level)
                      )}>
                        {student.risk_level.charAt(0).toUpperCase() + student.risk_level.slice(1)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className="text-foreground">{student.attendance}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              student.attendance >= 75 ? 'bg-risk-low' : student.attendance >= 50 ? 'bg-risk-medium' : 'bg-risk-high'
                            )}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Marks</span>
                          <span className="text-foreground">{student.marks}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              student.marks >= 65 ? 'bg-risk-low' : student.marks >= 45 ? 'bg-risk-medium' : 'bg-risk-high'
                            )}
                            style={{ width: `${student.marks}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">Confidence</span>
                        <span className="text-sm font-medium text-foreground">{student.confidence}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="glass rounded-xl overflow-hidden">
              <div className="divide-y divide-border/50">
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => setSelectedStudent(student)}
                      className={cn(
                        'flex items-center justify-between px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-accent/50',
                        student.risk_level === 'high' && 'bg-risk-high/5'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium',
                          getRiskBgColor(student.risk_level)
                        )}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(student.created_at)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Attendance</p>
                          <p className="text-sm font-medium text-foreground">{student.attendance}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Marks</p>
                          <p className="text-sm font-medium text-foreground">{student.marks}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Fees</p>
                          <p className="text-sm font-medium text-foreground">{student.fees_pending}%</p>
                        </div>
                        <div className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium border min-w-[80px] text-center',
                          getRiskBgColor(student.risk_level),
                          getRiskColor(student.risk_level)
                        )}>
                          {student.risk_level.charAt(0).toUpperCase() + student.risk_level.slice(1)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>

      <AddStudentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={mutate}
      />

      <StudentDetailPanel
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onUpdate={mutate}
      />
    </div>
    </ProtectedRoute>
  )
}
