'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Percent, DollarSign, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface AddStudentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddStudentModal({ open, onClose, onSuccess }: AddStudentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<{
    risk_level: string
    confidence: number
    reason: string
  } | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    department: '',
    attendance: '',
    subject1_marks: '',
    subject2_marks: '',
    subject3_marks: '',
    subject4_marks: '',
    subject5_marks: '',
    fees_pending: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setPreview(null)
  }

  const handlePreview = async () => {
    if (!formData.name || !formData.attendance || !formData.subject1_marks || !formData.subject2_marks || !formData.subject3_marks || !formData.subject4_marks || !formData.subject5_marks || !formData.fees_pending) {
      toast.error('Please fill all fields')
      return
    }

    // Simple client-side preview calculation
    const attendance = parseFloat(formData.attendance)
    const subject1 = parseFloat(formData.subject1_marks)
    const subject2 = parseFloat(formData.subject2_marks)
    const subject3 = parseFloat(formData.subject3_marks)
    const subject4 = parseFloat(formData.subject4_marks)
    const subject5 = parseFloat(formData.subject5_marks)
    const marks = (subject1 + subject2 + subject3 + subject4 + subject5) / 5
    const fees = parseFloat(formData.fees_pending)

    const normAttendance = Math.max(0, Math.min(100, attendance)) / 100
    const normMarks = Math.max(0, Math.min(100, marks)) / 100
    const normFees = Math.max(0, Math.min(100, fees)) / 100

    const z = 3.0 + (-2.5 * normAttendance) + (-2.0 * normMarks) + (1.8 * normFees)
    const riskProb = 1 / (1 + Math.exp(-z))

    let riskLevel: string
    let reasons: string[] = []

    if (riskProb >= 0.7) {
      riskLevel = 'high'
      if (attendance < 60) reasons.push('low attendance')
      if (marks < 50) reasons.push('low marks')
      if (fees > 50) reasons.push('high pending fees')
    } else if (riskProb >= 0.4) {
      riskLevel = 'medium'
      if (attendance < 75) reasons.push('below average attendance')
      if (marks < 65) reasons.push('below average marks')
      if (fees > 30) reasons.push('pending fees')
    } else {
      riskLevel = 'low'
      reasons = ['good academic standing']
    }

    setPreview({
      risk_level: riskLevel,
      confidence: Math.round(riskLevel === 'high' ? riskProb * 100 : (1 - riskProb) * 100),
      reason: reasons.join(', ') || 'multiple factors'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.attendance || !formData.subject1_marks || !formData.subject2_marks || !formData.subject3_marks || !formData.subject4_marks || !formData.subject5_marks || !formData.fees_pending) {
      toast.error('Please fill all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const BASE_URL = "http://127.0.0.1:8000"
      const response = await fetch(`${BASE_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          roll_no: formData.roll_no,
          department: formData.department,
          attendance: parseFloat(formData.attendance),
          subject1_marks: parseFloat(formData.subject1_marks),
          subject2_marks: parseFloat(formData.subject2_marks),
          subject3_marks: parseFloat(formData.subject3_marks),
          subject4_marks: parseFloat(formData.subject4_marks),
          subject5_marks: parseFloat(formData.subject5_marks),
          fees_pending: parseFloat(formData.fees_pending)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to add student')
      }

      const result = await response.json()
      
      toast.success(`${formData.name} added successfully`, {
        description: `Risk Level: ${result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)}`
      })

      setFormData({ name: '', roll_no: '', department: '', attendance: '', subject1_marks: '', subject2_marks: '', subject3_marks: '', subject4_marks: '', subject5_marks: '', fees_pending: '' })
      setPreview(null)
      onSuccess()
      onClose()
    } catch (error) {
      toast.error('Cannot add student', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-risk-high/10 border-risk-high/30 text-risk-high'
      case 'medium':
        return 'bg-risk-medium/10 border-risk-medium/30 text-risk-medium'
      case 'low':
        return 'bg-risk-low/10 border-risk-low/30 text-risk-low'
      default:
        return ''
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="glass rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Add New Student</h2>
                  <p className="text-sm text-muted-foreground">Enter student details for risk assessment</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Student Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter full name"
                      className="w-full h-11 pl-10 pr-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                </div>

                {/* Roll Number and Department */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Register/Roll Number</label>
                    <input
                      type="text"
                      value={formData.roll_no}
                      onChange={(e) => handleChange('roll_no', e.target.value)}
                      placeholder="e.g., 21CS001"
                      className="w-full h-11 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      placeholder="e.g., Computer Science"
                      className="w-full h-11 px-4 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                </div>

                {/* Attendance */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Attendance %</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.attendance}
                      onChange={(e) => handleChange('attendance', e.target.value)}
                      placeholder="0-100"
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                </div>

                {/* Subject Marks (5 subjects) */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Subject Marks (0-100)</label>
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((subject) => (
                      <div key={subject} className="space-y-1">
                        <label className="text-xs text-muted-foreground">Subject {subject}</label>
                        <div className="relative">
                          <Percent className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData[`subject${subject}_marks` as keyof typeof formData]}
                            onChange={(e) => handleChange(`subject${subject}_marks`, e.target.value)}
                            placeholder="0-100"
                            className="w-full h-10 pl-7 pr-2 text-sm rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Button */}
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Preview Risk Assessment
                </button>

                {/* Preview Result */}
                <AnimatePresence>
                  {preview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        'p-4 rounded-xl border',
                        getRiskStyles(preview.risk_level)
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Predicted Risk Level</p>
                          <p className="text-2xl font-bold mt-1">
                            {preview.risk_level.charAt(0).toUpperCase() + preview.risk_level.slice(1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-80">Confidence</p>
                          <p className="text-xl font-semibold">{preview.confidence}%</p>
                        </div>
                      </div>
                      <p className="text-sm mt-3 opacity-80">
                        Reason: {preview.reason}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Student'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
