'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/components/auth-provider'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { signin, signup, isLoading } = useAuthContext()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Sign In State
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
    role: 'mentor'
  })
  const [signinErrors, setSigninErrors] = useState<Record<string, string>>({})
  const [signinLoading, setSigninLoading] = useState(false)

  // Sign Up State
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'mentor'
  })
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({})
  const [signupLoading, setSignupLoading] = useState(false)

  // Sign In Handler
  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSigninErrors({})

    // Validation
    const errors: Record<string, string> = {}
    if (!signinData.email) errors.email = 'Email is required'
    if (!signinData.password) errors.password = 'Password is required'

    if (Object.keys(errors).length > 0) {
      setSigninErrors(errors)
      return
    }

    setSigninLoading(true)
    try {
      await signin(signinData.email, signinData.password)
      toast.success('Sign in successful!')
      router.push('/')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      toast.error(errorMessage)
      setSigninErrors({ submit: errorMessage })
    } finally {
      setSigninLoading(false)
    }
  }

  // Sign Up Handler
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupErrors({})

    // Validation
    const errors: Record<string, string> = {}
    if (!signupData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      errors.email = 'Invalid email format'
    }
    if (!signupData.fullName) errors.fullName = 'Full name is required'
    if (!signupData.password) {
      errors.password = 'Password is required'
    } else if (signupData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors)
      return
    }

    setSignupLoading(true)
    try {
      console.log('[SIGNUP] Submitting signup form...');
      await signup(signupData.email, signupData.password, signupData.fullName, signupData.role)
      console.log('[SIGNUP] Signup successful!');
      toast.success('Account created successfully! Redirecting...')
      // Auto redirect instead of tab switch
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      console.error('[SIGNUP] Signup error:', errorMessage);
      toast.error(errorMessage)
      setSignupErrors({ submit: errorMessage })
    } finally {
      setSignupLoading(false)
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
          <p className="text-sm text-muted-foreground">Student Risk Analysis & Monitoring System</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl border border-border/50 p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-accent/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                activeTab === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 rounded-md font-medium transition-all ${
                activeTab === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <motion.form
              key="signin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSignin}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  placeholder="mentor@example.com"
                  value={signinData.email}
                  onChange={(e) => setSigninData({ ...signinData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={signinLoading}
                />
                {signinErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{signinErrors.email}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                <select
                  value={signinData.role}
                  onChange={(e) => setSigninData({ ...signinData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={signinLoading}
                >
                  <option value="mentor">Mentor</option>
                  <option value="student">Student</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signinData.password}
                    onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={signinLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signinErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{signinErrors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Error */}
              {signinErrors.submit && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500">
                  {signinErrors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={signinLoading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signinLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </motion.form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSignup}
              className="space-y-4"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={signupData.fullName}
                  onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={signupLoading}
                />
                {signupErrors.fullName && (
                  <p className="text-xs text-red-500 mt-1">{signupErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  placeholder="mentor@example.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={signupLoading}
                />
                {signupErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{signupErrors.email}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                <select
                  value={signupData.role}
                  onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={signupLoading}
                >
                  <option value="mentor">Mentor</option>
                  <option value="student">Student</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={signupLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupErrors.password && (
                  <p className="text-xs text-red-500 mt-1">{signupErrors.password}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={signupLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{signupErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Error */}
              {signupErrors.submit && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500">
                  {signupErrors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </motion.form>
          )}

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  )
}
