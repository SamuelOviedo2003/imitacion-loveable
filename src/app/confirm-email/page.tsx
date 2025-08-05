"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash from URL (Supabase sends confirmation info in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) throw error

          if (data.user) {
            // Create user profile in the profiles table
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (profileError) {
              console.error('Error creating profile:', profileError)
              // Don't throw here - the account is still confirmed even if profile creation fails
            }

            setIsSuccess(true)
            setMessage('Email confirmed successfully! Your account has been created.')
          }
        } else if (type === 'recovery') {
          // Handle password recovery confirmation
          setIsSuccess(true)
          setMessage('Email confirmed! You can now reset your password.')
          setTimeout(() => {
            router.push('/reset-password')
          }, 2000)
        } else {
          throw new Error('Invalid confirmation link or missing parameters')
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setIsSuccess(false)
        setMessage(error.message || 'Failed to confirm email. The link may be invalid or expired.')
      } finally {
        setLoading(false)
      }
    }

    handleEmailConfirmation()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" style={{ backgroundColor: "#E8F4F8" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your email...</p>
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
          <div className="w-full max-w-sm mx-auto text-center">
            {/* Back button */}
            <div className="mb-8 text-left">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Sign In</span>
              </button>
            </div>

            <div className="mb-8">
              {isSuccess ? (
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              )}
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {isSuccess ? 'Email Confirmed!' : 'Confirmation Failed'}
              </h1>
              
              <p className={`text-slate-600 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                {message}
              </p>
            </div>

            {isSuccess ? (
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/')}
                  className="w-full h-12 bg-green-800 hover:bg-green-900 text-white font-medium"
                >
                  Continue to Sign In
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back to Sign In
                </Button>
                <p className="text-sm text-gray-600">
                  Need help? Contact support or try creating your account again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}