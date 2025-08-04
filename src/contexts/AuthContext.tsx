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

  const fetchBusinessData = async (userProfile?: any) => {
    try {
      let query = supabase.from('business_clients').select('business_id, company_name, avatar_url, city, state, time_zone, *')
      
      // If user has a business_id in their profile, fetch that specific business
      if (userProfile?.business_id) {
        query = query.eq('business_id', userProfile.business_id)
      } else {
        // Otherwise, get the first available business
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

  const switchBusiness = async (businessId: number) => {
    if (!user?.id) return
    
    try {
      // Update user's business_id in their profile
      const { error } = await supabase
        .from('profiles')
        .update({ business_id: businessId })
        .eq('id', user.id)
      
      if (!error) {
        // Update local profile state
        setUserProfile((prev: any) => prev ? { ...prev, business_id: businessId } : null)
        
        // Fetch the new business data
        await fetchBusinessData({ business_id: businessId })
        
        // Force a page reload to refresh all content with new business data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error switching business:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      
      if (initialSession?.user) {
        setSession(initialSession)
        setUser(initialSession.user)
        
        // Fetch user profile first, then business data based on their business_id
        const profile = await fetchUserProfile(initialSession.user.id)
        await fetchBusinessData(profile)
        
        // If user is Super Admin (role 0), fetch all businesses for the switcher
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
        
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          
          // Fetch user profile first, then business data
          const profile = await fetchUserProfile(session.user.id)
          await fetchBusinessData(profile)
          
          // If user is Super Admin (role 0), fetch all businesses
          if (profile?.role === 0) {
            await fetchAllBusinesses()
          }
        } else {
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