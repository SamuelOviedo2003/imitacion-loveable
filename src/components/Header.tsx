"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  user?: any
  businessData?: any
}

export default function Header({ user, businessData }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState(user)
  const [currentBusinessData, setCurrentBusinessData] = useState(businessData)
  const [isLoading, setIsLoading] = useState(!businessData) // Only loading if no businessData provided
  const pathname = usePathname()

  const fetchBusinessData = async (userId: string) => {
    try {
      const { data: businessDataResult, error: businessError } = await supabase
        .from('business_clients')
        .select('*')
        .limit(1)
        .single()
      
      if (!businessError && businessDataResult) {
        setCurrentBusinessData(businessDataResult)
        return businessDataResult
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
    }
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If we already have businessData passed as prop, we're ready immediately
        if (businessData) {
          setCurrentBusinessData(businessData)
          setIsLoading(false)
          return
        }
        
        setIsLoading(true)
        
        let currentUserData = user
        if (!currentUserData) {
          const { data: { user } } = await supabase.auth.getUser()
          currentUserData = user
          setCurrentUser(user)
        }
        
        if (currentUserData) {
          await fetchBusinessData(currentUserData.id)
        }
      } catch (error) {
        console.error('Error in Header data fetch:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [user, businessData])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="container mx-auto px-6 pt-6">
      <Card className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg">
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center">
            <Link href="/home">
              {!isLoading && (
                <img
                  src={currentBusinessData && currentBusinessData.avatar_url ? currentBusinessData.avatar_url : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-VM83AopODeRbWG1Ol4Eblk7MP7Qaka.png"}
                  alt={currentBusinessData && currentBusinessData.company_name ? `${currentBusinessData.company_name} Logo` : "Company Logo"}
                  className="h-12 w-auto bg-white rounded px-1 cursor-pointer"
                  style={{
                    filter: "drop-shadow(0 0 0 white)",
                    mixBlendMode: "multiply",
                  }}
                />
              )}
              {isLoading && (
                <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
              )}
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className={`transition-colors text-sm font-medium ${
                isActive('/dashboard') ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/new-leads"
              className={`transition-colors text-sm font-medium ${
                isActive('/new-leads') ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              New Leads
            </Link>
            <Link
              href="/appointment-setters"
              className={`transition-colors text-sm font-medium ${
                isActive('/appointment-setters') ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Appointment Setters
            </Link>
            <Link 
              href="/incoming-calls" 
              className={`transition-colors text-sm font-medium ${
                isActive('/incoming-calls') ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Incoming Calls
            </Link>
            <Link 
              href="/salesman" 
              className={`transition-colors text-sm font-medium ${
                isActive('/salesman') ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Salesman
            </Link>
            <Link 
              href="/fb-analysis" 
              className={`transition-colors text-sm font-medium ${
                isActive('/fb-analysis') ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              FB Analysis
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {currentUser && (
              <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">
                Sign Out
              </button>
            )}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
              {currentUser ? (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              ) : (
                <img src="/placeholder.svg?height=40&width=40" alt="Profile" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        </header>
      </Card>
    </div>
  )
}