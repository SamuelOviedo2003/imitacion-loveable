"use client"

import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  businessData: any | null
  userProfile: any | null
  allBusinesses: any[] | null
  isInitializing: boolean
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
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [lastSignOutTime, setLastSignOutTime] = useState<number | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const fetchUserProfile = useCallback(async (userId: string) => {
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
  }, [])

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

  const switchBusiness = useCallback(async (businessId: number) => {
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
        
        // No need to reload - React will re-render components with new business data
      }
    } catch (error) {
      console.error('Error switching business:', error)
    }
  }, [user?.id])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      // Don't auto-login if user is in the process of signing out
      if (isSigningOut) {
        setLoading(false)
        return
      }
      
      // Don't auto-login if we just signed out recently (within 5 seconds)
      if (lastSignOutTime && Date.now() - lastSignOutTime < 5000) {
        setLoading(false)
        return
      }
      
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        // If there's an error getting session, clear everything
        if (error) {
          console.error('Error getting session:', error)
          setSession(null)
          setUser(null)
          setBusinessData(null)
          setUserProfile(null)
          setAllBusinesses(null)
          setLoading(false)
          return
        }
        
        if (initialSession?.user) {
          // Verify the session is actually valid by checking if user exists
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
          
          if (userError || !currentUser || currentUser.id !== initialSession.user.id) {
            // Session is invalid, clear everything
            console.warn('Invalid session detected, clearing auth state')
            await supabase.auth.signOut({ scope: 'global' })
            setSession(null)
            setUser(null)
            setBusinessData(null)
            setUserProfile(null)
            setAllBusinesses(null)
            setLoading(false)
            return
          }
          
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
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        // Clear everything on error
        setSession(null)
        setUser(null)
        setBusinessData(null)
        setUserProfile(null)
        setAllBusinesses(null)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setBusinessData(null)
          setUserProfile(null)
          setAllBusinesses(null)
          setIsSigningOut(false)
          setLoading(false)
          return
        }
        
        if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Only update if it's the same user
          if (user && user.id === session.user.id) {
            setSession(session)
            setUser(session.user)
          }
          setLoading(false)
          return
        }
        
        if (session?.user && !isSigningOut && (!lastSignOutTime || Date.now() - lastSignOutTime > 5000)) {
          // Only auto-login if not in the middle of signing out and not recently signed out
          
          // If we already have a different user, clear everything first
          if (user && user.id !== session.user.id) {
            console.log('Different user detected, clearing previous session')
            setSession(null)
            setUser(null)
            setBusinessData(null)
            setUserProfile(null)
            setAllBusinesses(null)
          }
          
          // Show initialization screen for new logins
          if (!user || user.id !== session.user.id) {
            setIsInitializing(true)
          }
          
          setSession(session)
          setUser(session.user)
          
          // Fetch user profile first, then business data
          const profile = await fetchUserProfile(session.user.id)
          await fetchBusinessData(profile)
          
          // If user is Super Admin (role 0), fetch all businesses
          if (profile?.role === 0) {
            await fetchAllBusinesses()
          }
          
          // Complete initialization
          setIsInitializing(false)
        } else if (!session) {
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
  }, [user?.id, isSigningOut, lastSignOutTime])

  const signOut = useCallback(async () => {
    try {
      setIsSigningOut(true)
      setLoading(true)
      setLastSignOutTime(Date.now())
      
      // Clear local state first to prevent any race conditions
      setSession(null)
      setUser(null)
      setBusinessData(null)
      setUserProfile(null)
      setAllBusinesses(null)
      
      // Then sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) {
        console.error('Supabase signOut error:', error)
        // Don't throw error, continue with cleanup
      }
      
      // Additional cleanup: Clear any Supabase tokens from localStorage
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
            localStorage.removeItem(key)
          }
        })
        
        // Also clear sessionStorage
        const sessionKeys = Object.keys(sessionStorage)
        sessionKeys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (storageError) {
        console.warn('Could not clear localStorage/sessionStorage:', storageError)
      }
      
      // Force clear any cookies
      try {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=")
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
          if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          }
        })
      } catch (cookieError) {
        console.warn('Could not clear cookies:', cookieError)
      }
      
    } catch (error) {
      console.error('Error signing out:', error)
      // Ensure state is cleared even on error
      setSession(null)
      setUser(null)
      setBusinessData(null)
      setUserProfile(null)
      setAllBusinesses(null)
    } finally {
      setLoading(false)
      setIsSigningOut(false)
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    }
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    loading,
    businessData,
    userProfile,
    allBusinesses,
    isInitializing,
    signOut,
    switchBusiness,
  }), [user, session, loading, businessData, userProfile, allBusinesses, isInitializing, signOut, switchBusiness])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}