"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        setMessage('Invalid or expired reset link. Please request a new password reset.')
      }
    }

    checkSession()

    // Handle auth state changes (when user clicks the reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          setIsValidSession(true)
          setMessage('')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setIsSuccess(false)
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long')
      setIsSuccess(false)
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        console.error('Password update error:', error)
        setMessage(error.message || 'Failed to update password')
        setIsSuccess(false)
        setLoading(false)
        return
      }
      
      setIsSuccess(true)
      setMessage('Password updated successfully! You can now sign in with your new password.')
      setLoading(false)
    } catch (error: any) {
      console.error('Password update error:', error)
      setMessage(error.message || 'Failed to update password')
      setIsSuccess(false)
      setLoading(false)
    }
  }

  if (!isValidSession && !message.includes('Invalid or expired')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-200/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-200/20 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Centered Auth Form */}
      <div className="min-h-screen flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm">
          {/* Company Logo - Centered Above Form */}
          <div className="text-center mb-8">
            <Image 
              src="/images/DominateLocalLeads.png"
              alt="Dominate Local Leads"
              width={200}
              height={45}
              className="h-12 w-auto mx-auto"
            />
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={async () => {
                // Clear any existing session before redirecting
                await supabase.auth.signOut()
                // Force a clean redirect
                window.location.href = '/'
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>

          {/* Modern Card Container */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
            {/* Context-dependent title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                Reset Password
              </h1>
            </div>

            {!isValidSession ? (
              <div className="p-4 rounded-xl text-sm font-medium bg-red-50/80 text-red-700 border border-red-200/60 mb-6">
                {message}
                <div className="mt-3">
                  <button
                    onClick={() => router.push('/forgot-password')}
                    className="text-red-700 hover:text-red-800 font-medium underline"
                  >
                    Request new password reset
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${
                    isSuccess
                      ? 'bg-green-50/80 text-green-700 border border-green-200/60'
                      : 'bg-red-50/80 text-red-700 border border-red-200/60'
                  }`}>
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading || isSuccess}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : isSuccess ? 'Password Updated!' : 'Update Password'}
                </Button>

                {isSuccess && (
                  <div className="text-center pt-4">
                    <button
                      onClick={async () => {
                        // Clear any existing session before redirecting
                        await supabase.auth.signOut()
                        // Force a clean redirect
                        window.location.href = '/'
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Sign In with New Password
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}