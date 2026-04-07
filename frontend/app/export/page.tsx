'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import useSWR from 'swr'
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface Student {
  id: number
  name: string
  roll_no?: string
  department?: string
  attendance: number
  subject1_marks?: number
  subject2_marks?: number
  subject3_marks?: number
  subject4_marks?: number
  subject5_marks?: number
  fees_pending: number
  risk_level: string
  confidence: number
  created_at: string
}

const BASE_URL = "http://127.0.0.1:8000"

export default function ExportPage() {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx'>('csv')
  const [isExporting, setIsExporting] = useState(false)

  const { data } = useSWR<{ students: Student[] }>(`${BASE_URL}/export`, fetcher)
  const students = data?.students || []

  const formats = [
    {
      id: 'csv' as const,
      name: 'CSV',
      description: 'Comma-separated values, compatible with Excel',
      icon: FileSpreadsheet
    },
    {
      id: 'json' as const,
      name: 'JSON',
      description: 'JavaScript Object Notation, for developers',
      icon: FileJson
    },
    {
      id: 'xlsx' as const,
      name: 'Excel',
      description: 'Microsoft Excel format (.xlsx)',
      icon: FileText
    }
  ]

  const handleExport = async () => {
    if (students.length === 0) {
      toast.error('No data to export')
      return
    }

    setIsExporting(true)

    try {
      let content: string
      let mimeType: string
      let filename: string

      if (exportFormat === 'csv') {
        const headers = ['ID', 'Name', 'Roll No', 'Department', 'Attendance (%)', 'Subject1', 'Subject2', 'Subject3', 'Subject4', 'Subject5', 'Fees Pending (%)', 'Risk Level', 'Confidence (%)']
        const rows = students.map(s => [
          s.id,
          `"${s.name}"`,
          `"${s.roll_no || ''}"`,
          `"${s.department || ''}"`,
          s.attendance,
          s.subject1_marks || 0,
          s.subject2_marks || 0,
          s.subject3_marks || 0,
          s.subject4_marks || 0,
          s.subject5_marks || 0,
          s.fees_pending,
          s.risk_level,
          s.confidence
        ])
        content = [headers, ...rows].map(row => row.join(',')).join('\n')
        mimeType = 'text/csv'
        filename = 'edupulse_students.csv'
      } else if (exportFormat === 'json') {
        // Remove created_at from students for cleaner JSON
        const cleanStudents = students.map(({ created_at, ...rest }) => rest)
        content = JSON.stringify(cleanStudents, null, 2)
        mimeType = 'application/json'
        filename = 'edupulse_students.json'
      } else {
        // For xlsx, export as CSV
        const headers = ['ID', 'Name', 'Roll No', 'Department', 'Attendance (%)', 'Subject1', 'Subject2', 'Subject3', 'Subject4', 'Subject5', 'Fees Pending (%)', 'Risk Level', 'Confidence (%)']
        const rows = students.map(s => [
          s.id,
          `"${s.name}"`,
          `"${s.roll_no || ''}"`,
          `"${s.department || ''}"`,
          s.attendance,
          s.subject1_marks || 0,
          s.subject2_marks || 0,
          s.subject3_marks || 0,
          s.subject4_marks || 0,
          s.subject5_marks || 0,
          s.fees_pending,
          s.risk_level,
          s.confidence
        ])
        content = [headers, ...rows].map(row => row.join(',')).join('\n')
        mimeType = 'text/csv'
        filename = 'edupulse_students.csv'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${students.length} students`, {
        description: `File: ${filename}`
      })
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
        <div className="p-8 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Export Data</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Download your student data in various formats
            </p>
          </div>

          {/* Stats */}
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready to export</p>
                <p className="text-3xl font-semibold text-foreground mt-1">{students.length} students</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">High Risk</p>
                <p className="text-lg font-semibold text-risk-high">
                  {students.filter(s => s.risk_level === 'high').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Medium Risk</p>
                <p className="text-lg font-semibold text-risk-medium">
                  {students.filter(s => s.risk_level === 'medium').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low Risk</p>
                <p className="text-lg font-semibold text-risk-low">
                  {students.filter(s => s.risk_level === 'low').length}
                </p>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="glass rounded-xl p-6 mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Choose Format</h3>
            <div className="space-y-3">
              {formats.map((format) => (
                <motion.button
                  key={format.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setExportFormat(format.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
                    exportFormat === format.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    exportFormat === format.id ? 'bg-primary/20' : 'bg-accent'
                  )}>
                    <format.icon className={cn(
                      'w-5 h-5',
                      exportFormat === format.id ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{format.name}</p>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                  </div>
                  {exportFormat === format.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            disabled={isExporting || students.length === 0}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export {students.length} Students
              </>
            )}
          </motion.button>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
