"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Settings } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user, businessData, userProfile, allBusinesses, loading, signOut, switchBusiness } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const businessDropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()


  // Handle clicking outside the dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setIsBusinessDropdownOpen(false)
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

  const handleBusinessSwitch = async (businessId: number) => {
    setIsBusinessDropdownOpen(false)
    await switchBusiness(businessId)
  }

  const isSuperAdmin = userProfile?.role === 0
  
  // Simple logging to understand what's happening
  console.log('Header Debug:', {
    userRole: userProfile?.role,
    isSuperAdmin,
    allBusinessesCount: allBusinesses?.length,
    showSwitcher: isSuperAdmin && allBusinesses && allBusinesses.length > 1
  })

  // Don't render header until business data is loaded
  if (loading || !businessData || !businessData.avatar_url) {
    return null
  }

  return (
    <div className="container mx-auto px-6 pt-6 relative z-50">
      <Card className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg relative">
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
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
            
            {/* Business Switcher for Super Admin */}
            {isSuperAdmin && allBusinesses && allBusinesses.length > 1 && (
              <div className="relative z-[99999]" ref={businessDropdownRef}>
                <button
                  onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Switch Business"
                >
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                    isBusinessDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {isBusinessDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100000] max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Switch Business</p>
                      <p className="text-xs text-gray-500">Select a business to manage</p>
                    </div>
                    
                    {allBusinesses.map((business) => (
                      <button
                        key={business.business_id}
                        onClick={() => handleBusinessSwitch(business.business_id)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                          businessData?.business_id === business.business_id 
                            ? 'bg-blue-50 border-r-2 border-blue-600' 
                            : ''
                        }`}
                      >
                        {/* Business Logo */}
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {business.avatar_url ? (
                            <img 
                              src={business.avatar_url} 
                              alt={`${business.company_name} Logo`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              {business.company_name?.charAt(0) || 'B'}
                            </div>
                          )}
                        </div>
                        
                        {/* Business Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {business.company_name || 'Unnamed Business'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {business.city && business.state 
                              ? `${business.city}, ${business.state}`
                              : 'Location not set'
                            }
                          </p>
                        </div>
                        
                        {/* Active Indicator */}
                        {businessData?.business_id === business.business_id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
              href="/salesman" 
              className={`transition-colors text-sm font-medium ${
                isActive('/salesman') ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Salesman
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
              <div className="relative z-[99999]" ref={dropdownRef}>
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100000] shadow-2xl">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
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