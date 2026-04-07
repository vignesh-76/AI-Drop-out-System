'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import {
  LayoutDashboard,
  Users,
  Bell,
  BarChart3,
  Upload,
  Settings,
  Search,
  Moon,
  Sun,
  Download,
  Sparkles,
  LogOut,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth-provider'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const mentorNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Risk Analysis', href: '/risk-analysis', icon: TrendingDown },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Import Data', href: '/import', icon: Upload },
]

const studentNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Profile', href: '/profile', icon: Users },
]

const mentorSecondaryNav = [
  { name: 'Export', href: '/export', icon: Download },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const studentSecondaryNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface Alert {
  id: number
  student_id: number
  student_name: string
  risk_level: string
  reason: string
  created_at: string
  read: number
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout, mentor } = useAuthContext()

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark'
      setIsDark(savedTheme === 'dark')
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const BASE_URL = "http://127.0.0.1:8000"

  const { data: alertsData } = useSWR<{ alerts: Alert[] }>(
    `${BASE_URL}/alerts?unread_only=true`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const alerts = alertsData?.alerts || []
  const unreadAlertCount = alerts.length

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleThemeToggle = () => {
    setIsDark(!isDark)
    // Persist theme preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', !isDark ? 'dark' : 'light')
      // Apply theme to document
      if (!isDark) {
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    }
  }

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-sidebar-border">
        {!isCollapsed && <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">EduPulse</span>
        </div>}
        {isCollapsed && <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mx-auto">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Mentor Info */}
      {!isCollapsed && mentor && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-medium text-foreground truncate">{mentor.full_name}</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{mentor.role}</p>
          </div>
        </div>
      )}

      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-sidebar-accent border border-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sidebar-ring transition-colors"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Main
          </div>
        )}
        {(mentor?.role === 'student' ? studentNavigation : mentorNavigation).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : ''}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isCollapsed && 'justify-center',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-sidebar-primary')} />
              {!isCollapsed && item.name}
              {!isCollapsed && item.name === 'Alerts' && unreadAlertCount > 0 && mentor?.role === 'mentor' && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-risk-high/20 text-xs font-medium text-risk-high">
                  {unreadAlertCount}
                </span>
              )}
            </Link>
          )
        })}

        {!isCollapsed && (
          <div className="mt-6 mb-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tools
          </div>
        )}
        {(mentor?.role === 'student' ? studentSecondaryNav : mentorSecondaryNav).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : ''}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isCollapsed && 'justify-center',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn(
        'p-4 border-t border-sidebar-border space-y-2',
        isCollapsed && 'flex flex-col items-center'
      )}>
        <button
          onClick={handleThemeToggle}
          title={isCollapsed ? (isDark ? 'Dark Mode' : 'Light Mode') : ''}
          className={cn(
            'flex items-center gap-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200',
            isCollapsed ? 'p-2 justify-center' : 'w-full px-3 py-2.5'
          )}
        >
          {isDark ? <Moon className="w-4 h-4 flex-shrink-0" /> : <Sun className="w-4 h-4 flex-shrink-0" />}
          {!isCollapsed && (isDark ? 'Dark Mode' : 'Light Mode')}
        </button>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
          className={cn(
            'flex items-center gap-3 rounded-lg text-sm font-medium text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200',
            isCollapsed ? 'p-2 justify-center' : 'w-full px-3 py-2.5'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
}
