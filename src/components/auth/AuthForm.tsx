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
  const isSupabaseConfigured = envUrl && envKey && 
    !envUrl.includes('your_supabase') && 
    !envKey.includes('your_supabase') &&
    envUrl.startsWith('https://') &&
    envKey.length > 10

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!isSupabaseConfigured) {
      setMessage('Please configure your Supabase credentials in .env.local')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Welcome to Lead Management
            </h2>
          </div>
          <div className="relative">
            <Image 
              src="/images/loginImage.png"
              alt="Lead Management System"
              width={500} 
              height={400} 
              className="transform hover:scale-105 transition-transform duration-300 rounded-2xl shadow-xl"
            />
          </div>
          <div className="space-y-4">
            <p className="text-xl text-gray-600 max-w-md">
              Streamline your real estate business with powerful lead tracking and management tools.
            </p>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex items-center justify-center">
          <div className="modern-card w-full max-w-md">
            {/* Back to Sign In button - only show on Create Account screen */}
            {isSignUp && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="modern-button-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Sign In</span>
                </button>
              </div>
            )}

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600">
                {isSignUp ? 'Join us today to get started' : 'Sign in to continue to your dashboard'}
              </p>
              <div className="mt-4">
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
                </button>
              </div>
            </div>

            {!isSupabaseConfigured && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">⚠️ Setup Required</h3>
                <p className="text-sm text-amber-700">
                  Please configure your Supabase credentials in <code className="bg-amber-100 px-2 py-1 rounded text-xs">.env.local</code>
                </p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  className="h-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
              )}

              {isSignUp && (
                <div className="flex items-start space-x-3">
                  <Checkbox id="terms" className="mt-0.5" />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              )}

              {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${
                    message.includes('Check your email') || message.includes('successful')
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="modern-button modern-button-primary w-full h-12 text-base font-semibold"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}