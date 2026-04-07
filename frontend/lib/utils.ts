import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function getRiskColor(risk: string) {
  switch (risk) {
    case 'high':
      return 'text-risk-high'
    case 'medium':
      return 'text-risk-medium'
    case 'low':
      return 'text-risk-low'
    default:
      return 'text-muted-foreground'
  }
}

export function getRiskBgColor(risk: string) {
  switch (risk) {
    case 'high':
      return 'bg-risk-high/10 border-risk-high/30'
    case 'medium':
      return 'bg-risk-medium/10 border-risk-medium/30'
    case 'low':
      return 'bg-risk-low/10 border-risk-low/30'
    default:
      return 'bg-muted border-border'
  }
}
