"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user, businessData, loading, signOut } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()


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
    await signOut()
    router.push('/')
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  // Don't render header until business data is loaded
  if (loading || !businessData || !businessData.avatar_url) {
    return null
  }

  return (
    <div className="container mx-auto px-6 pt-6">
      <Card className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg">
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center">
            <Link href="/home">
              <img
                src={businessData.avatar_url}
                alt={businessData.company_name ? `${businessData.company_name} Logo` : "Company Logo"}
                className="h-12 w-auto bg-white rounded px-1 cursor-pointer"
                style={{
                  filter: "drop-shadow(0 0 0 white)",
                  mixBlendMode: "multiply",
                }}
              />
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
            {user && (
              <div className="relative z-50" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999]">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
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
            
            {!user && !loading && (
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