"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import LoadingOverlay from '@/components/LoadingOverlay'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading, isInitializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Use replace instead of push to prevent back navigation issues
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <LoadingOverlay 
        message="Setting up your workspace..." 
        show={true}
        blur={false}
      />
    )
  }

  if (isInitializing) {
    return (
      <LoadingOverlay 
        message="Welcome back! Preparing your dashboard..." 
        show={true}
        blur={false}
      />
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative" style={{ backgroundColor: "#E8F4F8" }}>
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <Header />
        {children}
      </div>
    </div>
  )
}