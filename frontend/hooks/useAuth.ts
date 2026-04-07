'use client'

import { useCallback, useEffect, useState } from 'react'
import { authAPI, tokenAPI, MentorData } from '@/lib/auth'

export interface UseAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  mentor: MentorData | null
  error: string | null
  
  signup: (email: string, password: string, fullName: string, role?: string) => Promise<void>
  signin: (email: string, password: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<{ reset_token: string }>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  refreshAuth: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mentor, setMentor] = useState<MentorData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = tokenAPI.getAccessToken()
        const mentorData = tokenAPI.getMentorData()

        console.log('[AUTH] Initializing auth state...', { hasToken: !!accessToken, hasMentor: !!mentorData })

        if (accessToken && mentorData) {
          // Check if token is expiring soon
          if (tokenAPI.isTokenExpiringSoon()) {
            console.log('[AUTH] Token expiring soon, attempting refresh...')
            const refreshToken = tokenAPI.getRefreshToken()
            if (refreshToken) {
              try {
                const response = await authAPI.refreshToken(refreshToken)
                tokenAPI.setTokens(
                  {
                    access_token: response.access_token,
                    refresh_token: response.refresh_token,
                    token_type: response.token_type
                  },
                  {
                    mentor_id: response.mentor_id,
                    email: response.email,
                    full_name: response.full_name,
                    role: response.role
                  }
                )
                setMentor({
                  mentor_id: response.mentor_id,
                  email: response.email,
                  full_name: response.full_name,
                  role: response.role
                })
                setIsAuthenticated(true)
                console.log('[AUTH] Token refreshed successfully')
              } catch (err) {
                console.log('[AUTH] Token refresh failed, clearing auth', err)
                tokenAPI.clearTokens()
                setIsAuthenticated(false)
                setMentor(null)
              }
            }
          } else {
            setMentor(mentorData)
            setIsAuthenticated(true)
            console.log('[AUTH] Auth state restored from localStorage')
          }
        } else {
          setIsAuthenticated(false)
          setMentor(null)
          console.log('[AUTH] No auth tokens found')
        }
      } catch (err) {
        console.error('[AUTH] Error during initialization:', err)
        setIsAuthenticated(false)
        setMentor(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signup = useCallback(
    async (email: string, password: string, fullName: string, role = 'mentor') => {
      setError(null)
      setIsLoading(true)
      try {
        const response = await authAPI.signup(email, password, fullName, role)
        tokenAPI.setTokens(
          {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            token_type: response.token_type
          },
          {
            mentor_id: response.mentor_id,
            email: response.email,
            full_name: response.full_name,
            role: response.role
          }
        )
        setMentor({
          mentor_id: response.mentor_id,
          email: response.email,
          full_name: response.full_name,
          role: response.role
        })
        setIsAuthenticated(true)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const signin = useCallback(
    async (email: string, password: string) => {
      setError(null)
      setIsLoading(true)
      try {
        const response = await authAPI.signin(email, password)
        tokenAPI.setTokens(
          {
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            token_type: response.token_type
          },
          {
            mentor_id: response.mentor_id,
            email: response.email,
            full_name: response.full_name,
            role: response.role
          }
        )
        setMentor({
          mentor_id: response.mentor_id,
          email: response.email,
          full_name: response.full_name,
          role: response.role
        })
        setIsAuthenticated(true)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    tokenAPI.clearTokens()
    setIsAuthenticated(false)
    setMentor(null)
    setError(null)
  }, [])

  const forgotPassword = useCallback(
    async (email: string) => {
      setError(null)
      try {
        return await authAPI.forgotPassword(email)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Password reset request failed'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      setError(null)
      try {
        await authAPI.resetPassword(token, newPassword)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = tokenAPI.getRefreshToken()
      if (!refreshToken) {
        logout()
        return
      }
      const response = await authAPI.refreshToken(refreshToken)
      tokenAPI.setTokens(
        {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          token_type: response.token_type
        },
        {
          mentor_id: response.mentor_id,
          email: response.email,
          full_name: response.full_name,
          role: response.role
        }
      )
      setMentor({
        mentor_id: response.mentor_id,
        email: response.email,
        full_name: response.full_name,
        role: response.role
      })
      setIsAuthenticated(true)
    } catch (err) {
      logout()
      throw err
    }
  }, [logout])

  return {
    isAuthenticated,
    isLoading,
    mentor,
    error,
    signup,
    signin,
    logout,
    forgotPassword,
    resetPassword,
    refreshAuth
  }
}
