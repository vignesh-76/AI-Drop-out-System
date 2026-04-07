'use client'

import { Sidebar } from '@/components/sidebar'
import { Dashboard } from '@/components/dashboard'
import { ProtectedRoute } from '@/components/protected-route'

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
          <Dashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}
