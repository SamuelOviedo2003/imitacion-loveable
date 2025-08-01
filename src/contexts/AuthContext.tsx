"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  businessData: any | null
  userProfile: any | null
  allBusinesses: any[] | null
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  switchBusiness: (businessId: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessData, setBusinessData] = useState<any | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [allBusinesses, setAllBusinesses] = useState<any[] | null>(null)

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (!profileError && profileData) {
        setUserProfile(profileData)
        return profileData
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
    return null
  }

  const fetchBusinessData = async (businessId?: number) => {
    try {
      let query = supabase.from('business_clients').select('*')
      
      if (businessId) {
        query = query.eq('business_id', businessId)
      } else {
        query = query.limit(1)
      }
      
      const { data: businessDataResult, error: businessError } = await query.single()
      
      if (!businessError && businessDataResult) {
        setBusinessData(businessDataResult)
        return businessDataResult
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
    }
    return null
  }

  const fetchAllBusinesses = async () => {
    try {
      const { data: businesses, error: businessesError } = await supabase
        .from('business_clients')
        .select('business_id, company_name, avatar_url, city, state')
        .order('company_name')
      
      if (!businessesError && businesses) {
        setAllBusinesses(businesses)
        return businesses
      }
    } catch (error) {
      console.error('Error fetching all businesses:', error)
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
        
        // Fetch user profile and business data
        const profile = await fetchUserProfile(initialSession.user.id)
        await fetchBusinessData()
        
        // If user is Super Admin (role 0), fetch all businesses
        if (profile?.role === 0) {
          await fetchAllBusinesses()
        }
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
          
          // Fetch user profile and business data
          const profile = await fetchUserProfile(session.user.id)
          await fetchBusinessData()
          
          // If user is Super Admin (role 0), fetch all businesses
          if (profile?.role === 0) {
            await fetchAllBusinesses()
          }
        } else {
          console.log('Clearing user from context')
          setSession(null)
          setUser(null)
          setBusinessData(null)
          setUserProfile(null)
          setAllBusinesses(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const switchBusiness = async (businessId: number) => {
    await fetchBusinessData(businessId)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    // State will be updated automatically by the auth state change listener
  }

  const value = {
    user,
    session,
    loading,
    businessData,
    userProfile,
    allBusinesses,
    signOut,
    switchBusiness,
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