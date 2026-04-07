'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { ProtectedRoute } from '@/components/protected-route'
import { StudentDashboard } from '@/components/student-dashboard'
import { Sidebar } from '@/components/sidebar'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface StudentData {
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

export default function StudentHome() {
  const router = useRouter()
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: studentsData, error: studentsError } = useSWR<{ students: StudentData[] }>(
    'http://127.0.0.1:8000/students',
    fetcher,
    { refreshInterval: 5000 }
  )

  const students = studentsData?.students || []

  // Auto-select first student or search
  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      const student = students.find(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_no?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || students[0]
      setSelectedStudent(student)
    }
  }, [students, searchTerm, selectedStudent])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Sidebar />
        <main className="pl-64">
          <div className="min-h-screen">
            {/* Search/Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10 p-4"
            >
              <div className="flex items-center gap-4">
                <select
                  value={selectedStudent?.id || ''}
                  onChange={(e) => {
                    const student = students.find(s => s.id === parseInt(e.target.value))
                    if (student) setSelectedStudent(student)
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="">Select a Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.roll_no ? `(${student.roll_no})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Dashboard Content */}
            <StudentDashboard student={selectedStudent || null} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
