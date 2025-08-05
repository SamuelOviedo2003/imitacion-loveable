"use client"

import Image from "next/image"
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

export function AuthForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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
        
        setMessage('Signing you in...')
        
        // Wait for the session to be established and then redirect
        let retries = 0
        const maxRetries = 10
        
        const checkSessionAndRedirect = async () => {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            setMessage('') // Clear the message before redirect
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
            setMessage('Sign-in successful! Redirecting...')
            // Force redirect even if session check fails
            setTimeout(() => router.push('/home'), 500)
          }
        }
        
        // Start checking for session
        setTimeout(checkSessionAndRedirect, 100)
        
        // Also set up a backup redirect after 3 seconds regardless
        setTimeout(() => {
          setMessage('') // Clear message before backup redirect
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
            {/* Back to Sign In button - only show on Create Account screen */}
            {isSignUp && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Sign In</span>
                </button>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {isSignUp ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="text-slate-600">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-green-800 hover:text-green-900 font-medium"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-sm font-medium text-amber-800 mb-2">⚠️ Supabase Not Configured</h3>
                <p className="text-sm text-amber-700">
                  To enable authentication, add your Supabase credentials to <code className="bg-amber-100 px-1 rounded">.env.local</code>
                </p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="h-12 border-slate-300 focus:border-green-800 focus:ring-green-800"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  className="h-12 border-slate-300 focus:border-green-800 focus:ring-green-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm text-slate-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-green-800 hover:text-green-900">
                    Forgot password?
                  </Link>
                </div>
              )}

              {isSignUp && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="text-sm text-slate-600">
                    I agree to the{" "}
                    <Link href="/terms" className="text-green-800 hover:text-green-900">
                      Terms & Conditions
                    </Link>
                  </Label>
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-md text-sm ${
                    message.includes('Check your email')
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
                {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}