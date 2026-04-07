'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit3, Trash2, Save, AlertTriangle, TrendingUp, Percent, DollarSign, Award, Clock } from 'lucide-react'
import { cn, getRiskColor, getRiskBgColor, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Student {
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

interface StudentDetailPanelProps {
  student: Student | null
  onClose: () => void
  onUpdate: () => void
}

export function StudentDetailPanel({ student, onClose, onUpdate }: StudentDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [riskDetails, setRiskDetails] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [followUps, setFollowUps] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [editData, setEditData] = useState({
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

  // Load risk details when student changes
  useEffect(() => {
    if (student) {
      loadRiskDetails()
    }
  }, [student?.id])

  const loadRiskDetails = async () => {
    if (!student) return
    setLoadingDetails(true)
    try {
      const [detailsRes, recsRes, followupsRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/students/${student.id}/risk-details`),
        fetch(`http://127.0.0.1:8000/students/${student.id}/recommendations`),
        fetch(`http://127.0.0.1:8000/follow-ups/${student.id}`)
      ])

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json()
        setRiskDetails(detailsData)
      }
      if (recsRes.ok) {
        const recsData = await recsRes.json()
        setRecommendations(recsData.recommendations || [])
      }
      if (followupsRes.ok) {
        const followupsData = await followupsRes.json()
        setFollowUps(followupsData.follow_ups || [])
      }
    } catch (error) {
      console.error('Failed to load risk details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const startEditing = () => {
    if (student) {
      setEditData({
        name: student.name,
        roll_no: student.roll_no || '',
        department: student.department || '',
        attendance: student.attendance.toString(),
        subject1_marks: student.subject1_marks.toString(),
        subject2_marks: student.subject2_marks.toString(),
        subject3_marks: student.subject3_marks.toString(),
        subject4_marks: student.subject4_marks.toString(),
        subject5_marks: student.subject5_marks.toString(),
        fees_pending: student.fees_pending.toString()
      })
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    if (!student) return
    
    setIsSaving(true)
    try {
      const BASE_URL = "http://127.0.0.1:8000"
      const response = await fetch(`${BASE_URL}/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          roll_no: editData.roll_no,
          department: editData.department,
          attendance: parseFloat(editData.attendance),
          subject1_marks: parseFloat(editData.subject1_marks),
          subject2_marks: parseFloat(editData.subject2_marks),
          subject3_marks: parseFloat(editData.subject3_marks),
          subject4_marks: parseFloat(editData.subject4_marks),
          subject5_marks: parseFloat(editData.subject5_marks),
          fees_pending: parseFloat(editData.fees_pending)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update')
      }

      const result = await response.json()
      toast.success('Student updated', {
        description: `New risk level: ${result.risk_level}`
      })
      
      setIsEditing(false)
      onUpdate()
      await loadRiskDetails()
    } catch (error) {
      toast.error('Cannot update student', {
        description: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!student) return
    
    setIsDeleting(true)
    try {
      const BASE_URL = "http://127.0.0.1:8000"
      const response = await fetch(`${BASE_URL}/students/${student.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')

      toast.success('Student removed')
      onUpdate()
      onClose()
    } catch (error) {
      toast.error('Failed to delete student')
    } finally {
      setIsDeleting(false)
    }
  }

  const avgMarks = student ? (student.subject1_marks + student.subject2_marks + student.subject3_marks + student.subject4_marks + student.subject5_marks) / 5 : 0

  return (
    <AnimatePresence>
      {student && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 glass border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Student Details</h2>
                <p className="text-sm text-muted-foreground">View and manage student data</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-0 border-b border-border/50 px-6 flex-shrink-0 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'risk', label: 'Risk', icon: '⚠️' },
                { id: 'recommendations', label: 'Actions', icon: '🎯' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {activeTab === 'overview' && (
                <>
                  {/* Profile Header */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold',
                      getRiskBgColor(student.risk_level),
                      student.risk_level === 'high' && 'glow-high'
                    )}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full text-xl font-semibold bg-input border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      ) : (
                        <h3 className="text-xl font-semibold text-foreground">{student.name}</h3>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">Added {formatDate(student.created_at)}</p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Basic Information</h4>
                    
                    {/* Roll Number */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Register/Roll Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.roll_no}
                          onChange={(e) => setEditData(prev => ({ ...prev, roll_no: e.target.value }))}
                          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="e.g., 21CS001"
                        />
                      ) : (
                        <p className="text-sm text-foreground font-medium">{student.roll_no || 'Not specified'}</p>
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Department</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.department}
                          onChange={(e) => setEditData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="e.g., Computer Science"
                        />
                      ) : (
                        <p className="text-sm text-foreground font-medium">{student.department || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  {/* Risk Badge */}
                  <div className={cn(
                    'p-4 rounded-xl border',
                    getRiskBgColor(student.risk_level)
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={cn('w-5 h-5', getRiskColor(student.risk_level))} />
                        <div>
                          <p className="text-sm text-muted-foreground">Risk Level</p>
                          <p className={cn('text-lg font-semibold', getRiskColor(student.risk_level))}>
                            {student.risk_level.charAt(0).toUpperCase() + student.risk_level.slice(1)} Risk
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <p className="text-lg font-semibold text-foreground">{student.confidence}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Academic Metrics</h4>
                    
                    {/* Attendance */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Attendance</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editData.attendance}
                            onChange={(e) => setEditData(prev => ({ ...prev, attendance: e.target.value }))}
                            className="w-20 text-sm text-right bg-input border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        ) : (
                          <span className="text-sm font-medium text-foreground">{student.attendance}%</span>
                        )}
                      </div>
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${student.attendance}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={cn(
                            'h-full rounded-full',
                            student.attendance >= 75 ? 'bg-risk-low' : student.attendance >= 50 ? 'bg-risk-medium' : 'bg-risk-high'
                          )}
                        />
                      </div>
                    </div>

                    {/* Subject Marks */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">Subject Marks (Avg: {avgMarks.toFixed(1)})</span>
                      </div>
                      {isEditing ? (
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map((subject) => (
                            <div key={subject}>
                              <label className="text-xs text-muted-foreground">S{subject}</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editData[`subject${subject}_marks` as keyof typeof editData]}
                                onChange={(e) => setEditData(prev => ({ ...prev, [`subject${subject}_marks`]: e.target.value }))}
                                className="w-full text-sm text-center bg-input border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5].map((subject) => {
                            const marks = student[`subject${subject}_marks` as keyof Student] as number
                            return (
                              <div key={subject} className="text-center">
                                <p className="text-xs text-muted-foreground">S{subject}</p>
                                <p className="text-sm font-medium text-foreground">{marks}</p>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Fees Pending */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Fees Pending</span>
                        </div>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editData.fees_pending}
                            onChange={(e) => setEditData(prev => ({ ...prev, fees_pending: e.target.value }))}
                            className="w-20 text-sm text-right bg-input border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        ) : (
                          <span className="text-sm font-medium text-foreground">₹{student.fees_pending}</span>
                        )}
                      </div>
                      <div className="h-2 rounded-full bg-border overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(student.fees_pending, 100)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                          className={cn(
                            'h-full rounded-full',
                            student.fees_pending <= 20 ? 'bg-risk-low' : student.fees_pending <= 50 ? 'bg-risk-medium' : 'bg-risk-high'
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'risk' && (
                <div className="space-y-4">
                  {loadingDetails ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">Loading risk analysis...</p>
                    </div>
                  ) : riskDetails ? (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Risk Factors
                        </h3>
                        <div className="space-y-2">
                          {riskDetails.reasons && riskDetails.reasons.length > 0 ? (
                            riskDetails.reasons.map((reason: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded bg-orange-50/50 border border-orange-200/50">
                                <span className="text-orange-600 text-sm mt-0.5">•</span>
                                <span className="text-sm text-foreground">{reason}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No risk factors</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Priority Score: {riskDetails.priority_score}/100</p>
                        <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${riskDetails.priority_score}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className={cn(
                              'h-full rounded-full',
                              riskDetails.priority_score >= 70 ? 'bg-risk-high'
                              : riskDetails.priority_score >= 50 ? 'bg-risk-medium' : 'bg-risk-low'
                            )}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No risk data available</p>
                  )}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-3">
                  {loadingDetails ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
                  ) : recommendations.length > 0 ? (
                    recommendations.map((rec: any) => (
                      <div
                        key={rec.id}
                        className={cn(
                          'p-3 rounded-lg border-2 text-sm',
                          rec.priority === 'high'
                            ? 'border-red-200 bg-red-50'
                            : rec.priority === 'medium'
                              ? 'border-yellow-200 bg-yellow-50'
                              : 'border-blue-200 bg-blue-50'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-semibold capitalize">{rec.action_type.replace(/_/g, ' ')}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap ${
                            rec.status === 'completed' ? 'bg-green-100 text-green-800'
                            : rec.status === 'in_progress' ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                        <p className="text-xs opacity-90">{rec.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recommendations yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="border-t border-border/50 px-6 py-4 space-y-3 flex-shrink-0">
              {isEditing ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={startEditing}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-risk-high/30 text-sm font-medium text-risk-high hover:bg-risk-high/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Remove'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
