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
      async (event, session) => {
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
    setLoading(true)
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" style={{ backgroundColor: "#E8F4F8" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" style={{ backgroundColor: "#E8F4F8" }}>
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        <div className="relative bg-gradient-to-br from-green-800 to-green-900 p-8 flex flex-col justify-center min-h-[600px]">
          <div className="relative flex-1 flex items-center justify-center">
            <Image
              src="/images/house.png"
              alt="Beautiful modern house"
              width={400}
              height={300}
              className="rounded-lg shadow-lg object-cover"
              priority
            />
          </div>
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            {/* Back button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={async () => {
                  // Clear any existing session before redirecting
                  await supabase.auth.signOut()
                  // Force a clean redirect
                  window.location.href = '/'
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Sign In</span>
              </button>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Set New Password
              </h1>
              <p className="text-slate-600">
                Enter your new password below.
              </p>
            </div>

            {!isValidSession ? (
              <div className="p-3 rounded-md text-sm bg-red-100 text-red-800 mb-6">
                {message}
                <div className="mt-3">
                  <button
                    onClick={() => router.push('/forgot-password')}
                    className="text-red-800 hover:text-red-900 font-medium underline"
                  >
                    Request new password reset
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    className="h-12 border-slate-300 focus:border-green-800 focus:ring-green-800"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    className="h-12 border-slate-300 focus:border-green-800 focus:ring-green-800"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-md text-sm ${
                    isSuccess
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading || isSuccess}
                  className="w-full h-12 bg-green-800 hover:bg-green-900 text-white font-medium disabled:opacity-50"
                >
                  {loading ? 'Updating...' : isSuccess ? 'Password Updated!' : 'Update Password'}
                </Button>
              </form>
            )}

            {isSuccess && (
              <div className="mt-6 text-center">
                <button
                  onClick={async () => {
                    // Clear any existing session before redirecting
                    await supabase.auth.signOut()
                    // Force a clean redirect
                    window.location.href = '/'
                  }}
                  className="text-green-800 hover:text-green-900 font-medium"
                >
                  Sign In with New Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}