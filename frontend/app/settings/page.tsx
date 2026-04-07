'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import {
  Bell,
  Moon,
  Sun,
  Shield,
  Database,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(true)
  const [notifications, setNotifications] = useState({
    highRisk: true,
    mediumRisk: false,
    newStudent: true,
    dailyDigest: false
  })
  const [thresholds, setThresholds] = useState({
    highRisk: 70,
    mediumRisk: 40
  })

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return
    }
    toast.success('All data cleared')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
        <div className="p-8 max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your EduPulse preferences
            </p>
          </div>

          {/* Appearance */}
          <div className="glass rounded-xl p-6 mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Appearance</h3>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                </div>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  isDark ? 'bg-primary' : 'bg-border'
                )}
              >
                <motion.div
                  animate={{ x: isDark ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-foreground"
                />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'highRisk', label: 'High Risk Alerts', description: 'Get notified when a high-risk student is detected' },
                { key: 'mediumRisk', label: 'Medium Risk Alerts', description: 'Get notified for medium-risk students' },
                { key: 'newStudent', label: 'New Students', description: 'Notification when new students are added' },
                { key: 'dailyDigest', label: 'Daily Digest', description: 'Receive a daily summary of alerts' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof notifications]
                    }))}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-border'
                    )}
                  >
                    <motion.div
                      animate={{ x: notifications[item.key as keyof typeof notifications] ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-foreground"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Thresholds */}
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">Risk Thresholds</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-foreground">High Risk Threshold</label>
                  <span className="text-sm font-mono text-risk-high">{thresholds.highRisk}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={thresholds.highRisk}
                  onChange={(e) => setThresholds(prev => ({ ...prev, highRisk: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-risk-high"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Students with risk probability above this threshold are marked as high risk
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-foreground">Medium Risk Threshold</label>
                  <span className="text-sm font-mono text-risk-medium">{thresholds.mediumRisk}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max={thresholds.highRisk - 10}
                  value={thresholds.mediumRisk}
                  onChange={(e) => setThresholds(prev => ({ ...prev, mediumRisk: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-risk-medium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Students between this and high threshold are marked as medium risk
                </p>
              </div>
            </div>
          </div>

          {/* AI Model Info */}
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">AI Model</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Algorithm</span>
                <span className="text-sm font-medium text-foreground">Logistic Regression</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Features Used</span>
                <span className="text-sm font-medium text-foreground">Attendance, Marks, Fees</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Model Status</span>
                <span className="flex items-center gap-2 text-sm font-medium text-risk-low">
                  <span className="w-2 h-2 rounded-full bg-risk-low" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass rounded-xl p-6 border-risk-high/30">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-risk-high" />
              <h3 className="text-lg font-medium text-risk-high">Danger Zone</h3>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">Clear All Data</p>
                <p className="text-sm text-muted-foreground">Delete all students and alerts permanently</p>
              </div>
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-risk-high/30 text-sm font-medium text-risk-high hover:bg-risk-high/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  )
}
