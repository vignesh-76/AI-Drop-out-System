'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export default function StudentLoginPage() {
  const router = useRouter()
  const [isSignIn, setIsSignIn] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Sign In State
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  })
  const [signInErrors, setSignInErrors] = useState<Record<string, string>>({})

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    department: ''
  })
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({})

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInErrors({})

    // Validate
    const errors: Record<string, string> = {}
    if (!signInData.email) errors.email = 'Email is required'
    if (!signInData.password) errors.password = 'Password is required'

    if (Object.keys(errors).length > 0) {
      setSignInErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/student/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signInData.email,
          password: signInData.password
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('student_id', data.student_id)
      localStorage.setItem('user_role', 'student')
      localStorage.setItem('user_name', data.name)
      localStorage.setItem('user_email', data.email)

      toast.success('Login successful!')
      router.push('/student-home')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
      setSignInErrors({ general: error.message || 'Login failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpErrors({})

    // Validate
    const errors: Record<string, string> = {}
    if (!signUpData.name) errors.name = 'Name is required'
    if (!signUpData.email) errors.email = 'Email is required'
    if (!signUpData.password) errors.password = 'Password is required (min 8 characters)'
    if (signUpData.password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpData.name,
          email: signUpData.email,
          password: signUpData.password,
          roll_no: signUpData.rollNo || null,
          department: signUpData.department || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Signup failed')
      }

      const data = await response.json()
      
      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('student_id', data.student_id)
      localStorage.setItem('user_role', 'student')
      localStorage.setItem('user_name', data.name)
      localStorage.setItem('user_email', data.email)

      toast.success('Account created and logged in!')
      router.push('/student-home')
    } catch (error: any) {
      toast.error(error.message || 'Signup failed')
      setSignUpErrors({ general: error.message || 'Signup failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <motion.div
        className="w-full max-w-md z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">EP</span>
            </div>
            <h1 className="text-2xl font-bold text-white">EduPulse</h1>
          </div>
          <p className="text-slate-400">Student Portal • Track Your Academic Progress</p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-xl"
        >
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white/10">
            <button
              onClick={() => setIsSignIn(true)}
              className={`pb-3 transition-all duration-300 ${
                isSignIn
                  ? 'text-blue-400 font-semibold border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`pb-3 transition-all duration-300 ${
                !isSignIn
                  ? 'text-blue-400 font-semibold border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {isSignIn ? (
            // Sign In Form
            <form onSubmit={handleSignIn} className="space-y-4">
              {signInErrors.general && (
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{signInErrors.general}</span>
                </motion.div>
              )}

              {/* Email */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder-slate-500 focus:outline-none ${
                    signInErrors.email
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-blue-400/50'
                  }`}
                  placeholder="your.email@example.com"
                />
                {signInErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{signInErrors.email}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder-slate-500 focus:outline-none ${
                      signInErrors.password
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-blue-400/50'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signInErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{signInErrors.password}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </motion.button>
            </form>
          ) : (
            // Sign Up Form
            <form onSubmit={handleSignUp} className="space-y-4">
              {signUpErrors.general && (
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{signUpErrors.general}</span>
                </motion.div>
              )}

              {/* Name */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder-slate-500 focus:outline-none ${
                    signUpErrors.name
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-blue-400/50'
                  }`}
                  placeholder="John Doe"
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder-slate-500 focus:outline-none ${
                    signUpErrors.email
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-white/10 focus:border-blue-400/50'
                  }`}
                  placeholder="your.email@example.com"
                />
              </motion.div>

              {/* Roll No */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Roll Number (Optional)
                </label>
                <input
                  type="text"
                  value={signUpData.rollNo}
                  onChange={(e) => setSignUpData({ ...signUpData, rollNo: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50"
                  placeholder="CSE-2021-001"
                />
              </motion.div>

              {/* Department */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Department (Optional)
                </label>
                <input
                  type="text"
                  value={signUpData.department}
                  onChange={(e) => setSignUpData({ ...signUpData, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50"
                  placeholder="Computer Science"
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder-slate-500 focus:outline-none ${
                      signUpErrors.password
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-blue-400/50'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Min 8 characters</p>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder-slate-500 focus:outline-none ${
                      signUpErrors.confirmPassword
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-blue-400/50'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{signUpErrors.confirmPassword}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>
          )}

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/5 text-slate-400">Or</span>
            </div>
          </div>

          {/* Mentor Link */}
          <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-slate-400 text-center mb-3">
              Are you a mentor?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Mentor Login
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
