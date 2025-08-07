"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoadingOverlay from '@/components/LoadingOverlay'
import Image from 'next/image'

export function AuthForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // Add a small delay to prevent immediate redirect after logout
      const timer = setTimeout(() => {
        router.push('/home')
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router])
  
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isSupabaseConfigured = envUrl && envKey

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!isSupabaseConfigured) {
      setMessage('Authentication service is not available. Please try again later.')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/confirm-email`,
            data: {
              full_name: fullName,
            }
          }
        })
        if (error) throw error
        
        if (data.user && !data.user.email_confirmed_at) {
          setMessage('Please check your email and click the confirmation link to activate your account.')
        } else {
          setMessage('Account created successfully!')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // Allow sign in regardless of email confirmation status
        
        // Immediately show loading transition
        setMessage('')
        setLoading(false) // Stop the form loading
        setIsTransitioning(true) // Start the transition loading
        
        // Wait for the session to be established and then redirect
        let retries = 0
        const maxRetries = 10
        
        const checkSessionAndRedirect = async () => {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            try {
              await router.push('/home')
            } catch (error) {
              console.error('Router.push failed:', error)
            }
            return
          }
          
          retries++
          if (retries < maxRetries) {
            setTimeout(checkSessionAndRedirect, 200)
          } else {
            // Force redirect even if session check fails
            setTimeout(() => router.push('/home'), 500)
          }
        }
        
        // Start checking for session
        setTimeout(checkSessionAndRedirect, 100)
        
        // Also set up a backup redirect after 3 seconds regardless
        setTimeout(() => {
          try {
            router.push('/home')
          } catch (error) {
            console.error('Router.push backup failed, using window.location:', error)
            window.location.href = '/home'
          }
        }, 3000)
      }
    } catch (error: any) {
      setMessage(error.message)
      setIsTransitioning(false) // Reset transition state on error
    } finally {
      if (!isTransitioning) {
        setLoading(false)
      }
    }
  }

  // Show loading overlay during sign-in transition
  if (isTransitioning) {
    return (
      <LoadingOverlay 
        message="Welcome back! Setting up your dashboard..." 
        show={true}
        blur={false}
      />
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

          {/* Back to Sign In button - only show on Create Account screen */}
          {isSignUp && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </div>
          )}

          {/* Modern Card Container */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
            {/* Context-dependent title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                {isSignUp ? 'Sign Up' : 'Login'}
              </h1>
            </div>

            {!isSupabaseConfigured && (
              <div className="mb-6 p-4 bg-red-50/80 border border-red-200/60 rounded-xl">
                <p className="text-sm text-red-700">
                  Authentication service is currently unavailable. Please try again later.
                </p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {isSignUp && (
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

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

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 bg-gray-50/50 border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Checkbox id="remember" className="rounded" />
                    <Label htmlFor="remember" className="ml-2 text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
              )}

              {isSignUp && (
                <div className="flex items-start text-sm">
                  <Checkbox id="terms" className="mt-0.5 rounded" />
                  <Label htmlFor="terms" className="ml-2 text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                      Terms & Conditions
                    </Link>
                  </Label>
                </div>
              )}

              {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${
                    message.includes('Check your email') || message.includes('successful')
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
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>

              {!isSignUp && (
                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    New here? Create an account
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}