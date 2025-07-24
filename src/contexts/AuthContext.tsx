"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  businessData: any | null
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessData, setBusinessData] = useState<any | null>(null)

  const fetchBusinessData = async (userId: string) => {
    try {
      const { data: businessDataResult, error: businessError } = await supabase
        .from('business_clients')
        .select('*')
        .limit(1)
        .single()
      
      if (!businessError && businessDataResult) {
        setBusinessData(businessDataResult)
        return businessDataResult
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
    }
    return null
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      
      if (initialSession?.user) {
        setSession(initialSession)
        setUser(initialSession.user)
        
        // Fetch business data but don't let it block the initial load
        fetchBusinessData(initialSession.user.id).catch(error => {
          console.error('Initial business data fetch failed:', error)
        })
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          console.log('Setting user in context:', session.user.email)
          setSession(session)
          setUser(session.user)
          
          // Fetch business data but don't let it block the auth flow
          fetchBusinessData(session.user.id).catch(error => {
            console.error('Business data fetch failed, but auth will continue:', error)
          })
        } else {
          console.log('Clearing user from context')
          setSession(null)
          setUser(null)
          setBusinessData(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    // State will be updated automatically by the auth state change listener
  }

  const value = {
    user,
    session,
    loading,
    businessData,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}