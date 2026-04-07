'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import { cn, getRiskColor, getRiskBgColor } from '@/lib/utils'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Download,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface ImportResult {
  id: number
  name: string
  risk_level: string
  confidence: number
}

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
}

export default function ImportPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState<ImportResult[]>([])
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setResults([])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    maxFiles: 1
  })

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      
      if (!data.students || data.students.length === 0) {
        toast('No students imported. Check CSV format.', {
          description: 'Ensure all required columns are present'
        })
        setUploadProgress(100)
        return
      }

      setUploadProgress(100)
      setResults(data.students || [])
      
      const highRiskCount = data.students.filter((s: ImportResult) => s.risk_level === 'high').length
      
      toast.success(`Imported ${data.imported} students successfully!`, {
        description: highRiskCount > 0 
          ? `${highRiskCount} high-risk students detected`
          : 'All students assessed successfully'
      })

      setFile(null)
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const clearFile = () => {
    setFile(null)
    setResults([])
  }

  const downloadSampleCSV = async () => {
    try {
      // Create a sample CSV with the correct format
      const headers = 'name,roll_no,department,attendance,subject1_marks,subject2_marks,subject3_marks,subject4_marks,subject5_marks,fees_pending'
      const sampleRows = [
        'Raj Kumar,21CS001,Computer Science,85,78,82,80,85,79,5',
        'Priya Singh,21CS002,Computer Science,92,88,90,89,91,87,2',
        'Amit Patel,21CS003,Computer Science,45,40,42,38,35,39,75',
        'Zara Khan,21IT001,Information Technology,70,65,68,70,72,66,40',
        'Rohan Verma,21CE001,Civil Engineering,55,50,52,48,51,49,50'
      ]
      const csvContent = `${headers}\n${sampleRows.join('\n')}`
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'students_sample.csv'
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Sample CSV downloaded successfully', {
        description: 'Use this format to import student data'
      })
    } catch (error) {
      toast.error('Failed to download sample CSV')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
        <div className="p-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Import Data</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Upload CSV, Excel, or JSON files to bulk import students
              </p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Sample CSV
            </button>
          </div>

          {/* Upload Zone */}
          <div className="glass rounded-xl p-8 mb-6">
            <div
              {...getRootProps()}
              className={cn(
                'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/30'
              )}
            >
              <input {...getInputProps()} />
              
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        clearFile()
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Choose a different file
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {isDragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse from your computer
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-1 rounded bg-accent">CSV</span>
                      <span className="px-2 py-1 rounded bg-accent">Excel</span>
                      <span className="px-2 py-1 rounded bg-accent">JSON</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Progress */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center"
                >
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <p className="text-sm font-medium text-foreground mb-2">Processing file...</p>
                  <div className="w-48 h-2 rounded-full bg-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{uploadProgress}%</p>
                </motion.div>
              )}
            </div>

            {/* Upload Button */}
            {file && !isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-6"
              >
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Upload className="w-4 h-4" />
                  Upload and Process
                </button>
              </motion.div>
            )}
          </div>

          {/* Expected Format */}
          <div className="glass rounded-xl p-6 mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Expected CSV Format</h3>
            <div className="bg-card rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-muted-foreground space-y-2">
                <div className="text-xs uppercase tracking-wider mb-3">Required Columns (in order):</div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-primary font-semibold">1. name</span>
                    <p className="text-muted-foreground mt-1">Student full name</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">2. roll_no</span>
                    <p className="text-muted-foreground mt-1">Roll number (optional)</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">3. department</span>
                    <p className="text-muted-foreground mt-1">Department (optional)</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">4. attendance</span>
                    <p className="text-muted-foreground mt-1">Attendance % (0-100)</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">5. subject1_marks</span>
                    <p className="text-muted-foreground mt-1">Subject 1 marks (0-100)</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">6. subject2_marks</span>
                    <p className="text-muted-foreground mt-1">Subject 2 marks (0-100)</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">7. subject3_marks</span>
                    <p className="text-muted-foreground mt-1">Subject 3 marks (0-100)</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">8. subject4_marks</span>
                    <p className="text-muted-foreground mt-1">Subject 4 marks (0-100)</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">9. subject5_marks</span>
                    <p className="text-muted-foreground mt-1">Subject 5 marks (0-100)</p>
                  </div>
                  <div>
                    <span className="text-primary font-semibold">10. fees_pending</span>
                    <p className="text-muted-foreground mt-1">Fees pending % (0-100)</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Example:</p>
                <div className="text-foreground space-y-1 text-xs">
                  <div>Raj Kumar,21CS001,Computer Science,85,78,82,80,85,5</div>
                  <div>Priya Singh,21CS002,Computer Science,92,88,90,89,91,2</div>
                  <div>Amit Patel,21CS003,Computer Science,45,40,42,38,35,75</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              💡 <strong>Tips:</strong> All numeric values should be between 0-100. The system will automatically calculate average marks and predict risk levels (LOW, MEDIUM, HIGH) based on attendance, average marks, and fees pending.
            </p>
          </div>

          {/* Import Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Import Results</h3>
                    <p className="text-sm text-muted-foreground">
                      {results.length} students imported successfully
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-risk-high/10 text-risk-high text-xs font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {results.filter(r => r.risk_level === 'high').length} High Risk
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-risk-low/10 text-risk-low text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {results.filter(r => r.risk_level === 'low').length} Low Risk
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        'flex items-center justify-between px-6 py-4',
                        result.risk_level === 'high' && 'bg-risk-high/5'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium',
                          getRiskBgColor(result.risk_level)
                        )}>
                          {result.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{result.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Confidence: {result.confidence}%
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border',
                        getRiskBgColor(result.risk_level),
                        getRiskColor(result.risk_level)
                      )}>
                        {result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)} Risk
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
