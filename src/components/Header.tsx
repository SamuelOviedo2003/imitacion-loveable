"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  user?: any
  businessData?: any
}

export default function Header({ user, businessData }: HeaderProps) {
  const [currentUser, setCurrentUser] = useState(user)
  const [currentBusinessData, setCurrentBusinessData] = useState(businessData)
  const [isLoading, setIsLoading] = useState(!user) // Loading if no user provided
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
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
        // If we already have user and businessData passed as props, we're ready immediately
        if (user && businessData) {
          setCurrentUser(user)
          setCurrentBusinessData(businessData)
          setIsLoading(false)
          return
        }
        
        // If we have user but no businessData, just fetch business data
        if (user && !businessData) {
          setCurrentUser(user)
          await fetchBusinessData(user.id)
          setIsLoading(false)
          return
        }
        
        // Only fetch user if we don't have one
        if (!user) {
          setIsLoading(true)
          const { data: { user: fetchedUser } } = await supabase.auth.getUser()
          if (fetchedUser) {
            setCurrentUser(fetchedUser)
            await fetchBusinessData(fetchedUser.id)
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error in Header data fetch:', error)
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [user, businessData])

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    setIsDropdownOpen(false)
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">
                        {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {!currentUser && !isLoading && (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                <img src="/placeholder.svg?height=40&width=40" alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </header>
      </Card>
    </div>
  )
}