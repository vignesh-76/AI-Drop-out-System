'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/components/auth-provider'
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword } = useAuthContext()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!email) {
      setErrors({ email: 'Email is required' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Invalid email format' })
      return
    }

    setLoading(true)
    try {
      const response = await forgotPassword(email)
      setSubmitted(true)
      if (response.reset_token) {
        setResetToken(response.reset_token)
      }
      toast.success('Check your email for the reset link!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">EduPulse</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            {submitted
              ? 'Check your email for the reset link'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-border/50 p-8 shadow-xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  placeholder="mentor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Back to Login */}
              <div className="pt-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Check your email for the password reset link
                </p>
              </div>

              {resetToken && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-left">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-mono break-all">
                    Token: {resetToken}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    (Demo: Copy this token to use on the reset page)
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                The link will expire in 24 hours. If you don't receive an email, check your spam folder.
              </p>

              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
