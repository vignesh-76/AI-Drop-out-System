'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth-provider'
import { toast } from 'sonner'
import { AlertTriangle, TrendingUp, Settings, CheckCircle, Clock, AlertCircle, Award, BarChart3, Plus, Send } from 'lucide-react'
import Link from 'next/link'

interface RiskStudent {
  student_id: number
  name: string
  roll_no?: string
  department?: string
  risk_level: string
  priority_score: number
  confidence: number
  main_reasons: string[]
  counselor_assigned?: string
  pending_actions: number
  last_alert?: string
}

interface StudentDetails {
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
  priority_score: number
  risk_details: {
    reasons: string[]
    risk_factors: Array<any>
  }
  recommendations: Array<{
    id: number
    action_type: string
    description: string
    priority: string
    status: string
  }>
  counselor?: {
    id: number
    mentor_name: string
    status: string
  }
  follow_ups: Array<{
    id: number
    action_description: string
    status: string
    due_date?: string
  }>
}

const RiskLevelBadge = ({ level }: { level: string }) => {
  const colors = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[level as keyof typeof colors] || colors.low}`}>
      {level.toUpperCase()}
    </span>
  )
}

const PriorityScore = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s >= 70) return 'text-red-600'
    if (s >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 282.6} 282.6`}
            className={`${getColor(score)} transition-all`}
          />
        </svg>
        <span className={`absolute text-lg font-bold ${getColor(score)}`}>{score}</span>
      </div>
    </div>
  )
}

export default function RiskAnalysisPage() {
  const router = useRouter()
  const { isLoading, mentor } = useAuthContext()
  const [students, setStudents] = useState<RiskStudent[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showRecommendationForm, setShowRecommendationForm] = useState(false)
  const [assigningCounselor, setAssigningCounselor] = useState(false)
  const [formData, setFormData] = useState({
    action_type: 'academic_support',
    description: '',
    priority: 'medium'
  })

  // Redirect students from this page
  useEffect(() => {
    if (!isLoading && mentor && mentor.role === 'student') {
      toast.error('You do not have access to this page')
      router.push('/')
    }
  }, [isLoading, mentor, router])

  useEffect(() => {
    const fetchHighRiskStudents = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/high-risk-monitoring')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setStudents(data.high_risk_students || [])
      } catch (error) {
        toast.error('Failed to load high-risk students')
      } finally {
        setLoading(false)
      }
    }

    fetchHighRiskStudents()
  }, [])

  const handleViewDetails = async (studentId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/students/${studentId}/full-profile`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSelectedStudent(data)
      setActiveTab('overview')
    } catch (error) {
      toast.error('Failed to load student details')
    }
  }

  const handleAddRecommendation = async () => {
    if (!selectedStudent || !formData.description.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/students/${selectedStudent.id}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: formData.action_type,
          description: formData.description,
          priority: formData.priority
        })
      })

      if (!res.ok) throw new Error('Failed to add recommendation')

      toast.success('Recommendation added successfully')

      // Refresh student details
      const updatedRes = await fetch(`http://127.0.0.1:8000/students/${selectedStudent.id}/full-profile`)
      const updatedData = await updatedRes.json()
      setSelectedStudent(updatedData)

      // Reset form
      setFormData({ action_type: 'academic_support', description: '', priority: 'medium' })
      setShowRecommendationForm(false)
    } catch (error) {
      toast.error('Failed to add recommendation')
    }
  }

  const handleAssignRandomCounselor = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student')
      return
    }

    setAssigningCounselor(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/students/${selectedStudent.id}/assign-counselor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ random: true })
      })

      if (!res.ok) throw new Error('Failed to assign counselor')

      const data = await res.json()
      toast.success(`Counselor ${data.counselor_name} assigned successfully`)

      // Refresh student details
      const updatedRes = await fetch(`http://127.0.0.1:8000/students/${selectedStudent.id}/full-profile`)
      const updatedData = await updatedRes.json()
      setSelectedStudent(updatedData)
    } catch (error) {
      toast.error('Failed to assign counselor')
    } finally {
      setAssigningCounselor(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Risk Analysis & Monitoring</h1>
          <p className="text-muted-foreground">Track student dropout risk and intervention recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                High-Risk Students ({students.length})
              </h2>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No high-risk students</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <button
                      key={student.student_id}
                      onClick={() => handleViewDetails(student.student_id)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedStudent?.id === student.student_id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.roll_no || 'N/A'}</p>
                        </div>
                        <RiskLevelBadge level={student.risk_level} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Priority: {student.priority_score}</span>
                        {student.pending_actions > 0 && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                            {student.pending_actions} action{student.pending_actions !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Student Header */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                      <p className="text-muted-foreground">
                        {selectedStudent.roll_no && `Roll: ${selectedStudent.roll_no}`}
                        {selectedStudent.department && ` • ${selectedStudent.department}`}
                      </p>
                    </div>
                    <RiskLevelBadge level={selectedStudent.risk_level} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Priority Score</p>
                      <PriorityScore score={selectedStudent.priority_score} />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Confidence</p>
                      <div className="text-2xl font-bold">{selectedStudent.confidence}%</div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Counselor</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{selectedStudent.counselor?.mentor_name || 'Not assigned'}</div>
                        <button
                          onClick={handleAssignRandomCounselor}
                          disabled={assigningCounselor}
                          className="ml-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                          {assigningCounselor ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-card rounded-lg border border-border shadow-sm">
                  <div className="flex border-b border-border">
                    {[
                      { id: 'overview', label: 'Overview', icon: BarChart3 },
                      { id: 'recommendations', label: 'Recommendations', icon: Award },
                      { id: 'followups', label: 'Follow-ups', icon: Clock },
                    ].map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                            activeTab === tab.id
                              ? 'text-primary border-b-2 border-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Risk Explanation */}
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Risk Factors
                          </h3>
                          <div className="space-y-2">
                            {selectedStudent.risk_details.reasons.length > 0 ? (
                              selectedStudent.risk_details.reasons.map((reason, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-orange-800">{reason}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted-foreground">No risk factors identified</p>
                            )}
                          </div>
                        </div>

                        {/* Academic Metrics */}
                        <div>
                          <h3 className="font-semibold mb-3">Academic Performance</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                              <p className="text-lg font-bold">{selectedStudent.attendance}%</p>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Average Marks</p>
                              <p className="text-lg font-bold">
                                {(
                                  (selectedStudent.subject1_marks +
                                    selectedStudent.subject2_marks +
                                    selectedStudent.subject3_marks +
                                    selectedStudent.subject4_marks +
                                    selectedStudent.subject5_marks) /
                                  5
                                ).toFixed(1)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">Subject-wise Marks</p>
                            <div className="grid grid-cols-5 gap-2">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="text-center">
                                  <p className="text-xs font-medium">S{i}</p>
                                  <p className="text-sm font-bold">{(selectedStudent as any)[`subject${i}_marks`]}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'recommendations' && (
                      <div className="space-y-3">
                        {/* Add Recommendation Button/Form */}
                        {!showRecommendationForm ? (
                          <button
                            onClick={() => setShowRecommendationForm(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors mb-4"
                          >
                            <Plus className="w-4 h-4" />
                            Add New Recommendation
                          </button>
                        ) : (
                          <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 mb-4">
                            <h4 className="font-semibold text-sm mb-3 text-foreground">Add Counselor Recommendation</h4>

                            <div className="space-y-3">
                              {/* Action Type Select */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                  Action Type
                                </label>
                                <select
                                  value={formData.action_type}
                                  onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                  <option value="academic_support">Academic Support</option>
                                  <option value="financial_support">Financial Support</option>
                                  <option value="counseling">Counseling</option>
                                  <option value="attendance_warning">Attendance Warning</option>
                                  <option value="mentoring">Mentoring</option>
                                  <option value="extra_classes">Extra Classes</option>
                                </select>
                              </div>

                              {/* Priority Select */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                  Priority
                                </label>
                                <select
                                  value={formData.priority}
                                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>

                              {/* Description Textarea */}
                              <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1">
                                  Solution/Recommendation
                                </label>
                                <textarea
                                  value={formData.description}
                                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                  placeholder="Describe the recommended solution for this student's problem based on their risk level..."
                                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                  rows={3}
                                />
                              </div>

                              {/* Form Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={handleAddRecommendation}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                  <Send className="w-4 h-4" />
                                  Submit Recommendation
                                </button>
                                <button
                                  onClick={() => {
                                    setShowRecommendationForm(false)
                                    setFormData({ action_type: 'academic_support', description: '', priority: 'medium' })
                                  }}
                                  className="flex-1 px-3 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Existing Recommendations */}
                        {selectedStudent.recommendations.length > 0 ? (
                          selectedStudent.recommendations.map((rec) => (
                            <div
                              key={rec.id}
                              className={`p-4 rounded-lg border-2 ${
                                rec.priority === 'high'
                                  ? 'border-red-200 bg-red-50'
                                  : rec.priority === 'medium'
                                    ? 'border-yellow-200 bg-yellow-50'
                                    : 'border-blue-200 bg-blue-50'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm capitalize">{rec.action_type.replace(/_/g, ' ')}</h4>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    rec.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : rec.status === 'in_progress'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {rec.status}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/80">{rec.description}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No recommendations yet</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'followups' && (
                      <div className="space-y-3">
                        {selectedStudent.follow_ups.length > 0 ? (
                          selectedStudent.follow_ups.map((followup) => (
                            <div
                              key={followup.id}
                              className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-medium text-sm flex-1">{followup.action_description}</p>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${
                                    followup.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : followup.status === 'in_progress'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {followup.status}
                                </span>
                              </div>
                              {followup.due_date && (
                                <p className="text-xs text-muted-foreground">Due: {new Date(followup.due_date).toLocaleDateString()}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No follow-ups tracked</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border shadow-sm p-12 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a student to view detailed risk analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
