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
              onClick={() => router.back()}
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
                Forgot Password
              </h1>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
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