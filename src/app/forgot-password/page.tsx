"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      setIsSuccess(true)
      setMessage('Check your email for the password reset link!')
    } catch (error: any) {
      setMessage(error.message)
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
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
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Sign In</span>
              </button>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Reset Password
              </h1>
              <p className="text-slate-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 border-slate-300 focus:border-green-800 focus:ring-green-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                disabled={loading}
                className="w-full h-12 bg-green-800 hover:bg-green-900 text-white font-medium"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}