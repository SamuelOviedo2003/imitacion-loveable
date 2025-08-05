"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Settings, Building2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const { user, businessData, userProfile, allBusinesses, loading, signOut, switchBusiness } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const businessDropdownRef = useRef<HTMLDivElement>(null)
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const router = useRouter()


  // Only show header when we have business data (no complex loading logic)
  useEffect(() => {
    if (businessData) {
      setShowHeader(true)
    }
  }, [businessData?.business_id])

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
    setIsSigningOut(true)
    try {
      await signOut()
      // Wait longer for the signOut to fully complete
      setTimeout(() => {
        // Use replace to prevent back navigation to logged-in state
        window.location.replace('/')
      }, 500)
    } catch (error) {
      console.error('Error during sign out:', error)
      // Even if there's an error, still try to redirect
      setTimeout(() => {
        window.location.replace('/')
      }, 100)
    }
    // Note: Don't set setIsSigningOut(false) since we're redirecting anyway
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleBusinessSwitch = async (businessId: number) => {
    setIsBusinessDropdownOpen(false)
    await switchBusiness(businessId)
  }


  const isSuperAdmin = userProfile?.role === 0
  
  // Filter businesses to only show those with truthy avatar_url
  const filteredBusinesses = allBusinesses?.filter(business => business.avatar_url) || []
  

  // Don't render header until we have a user and not loading
  if (loading || !user) {
    return null
  }

  // Check if user has no business association
  const hasNoBusiness = !businessData

  return (
    <div className="container mx-auto px-6 pt-6 relative z-50">
      <Card className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-lg relative">
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2">
            {hasNoBusiness ? (
              <div className="flex items-center gap-3">
                <div className="relative h-12 min-w-[48px]">
                  <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p className="font-medium">No Business Associated</p>
                  <p className="text-xs">Contact admin to assign business</p>
                </div>
              </div>
            ) : (
              <Link href="/home">
                <div className="relative h-12 min-w-[48px]">
                  {businessData.avatar_url ? (
                    <img
                      key={`logo-${businessData.business_id}`}
                      src={businessData.avatar_url}
                      alt={businessData.company_name ? `${businessData.company_name} Logo` : "Company Logo"}
                      className="h-12 w-auto bg-white rounded px-1 cursor-pointer"
                      style={{
                        filter: "drop-shadow(0 0 0 white)",
                        mixBlendMode: "multiply",
                      }}
                      onError={(e) => {
                        // Replace with fallback icon on error
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="h-12 w-12 bg-gray-100 rounded flex items-center justify-center cursor-pointer">
                            <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center cursor-pointer">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </Link>
            )}
            
            {/* Business Switcher for Super Admin */}
            {!hasNoBusiness && isSuperAdmin && filteredBusinesses.length > 1 && (
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
                    
                    {filteredBusinesses.map((business) => (
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
            {hasNoBusiness ? (
              <>
                <span className="text-sm font-medium text-gray-400 cursor-not-allowed">Dashboard</span>
                <span className="text-sm font-medium text-gray-400 cursor-not-allowed">New Leads</span>
                <span className="text-sm font-medium text-gray-400 cursor-not-allowed">Salesman</span>
                <span className="text-sm font-medium text-gray-400 cursor-not-allowed">Incoming Calls</span>
                <span className="text-sm font-medium text-gray-400 cursor-not-allowed">FB Analysis</span>
              </>
            ) : (
              <>
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
              </>
            )}
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
                      disabled={isSigningOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningOut ? 'Signing Out...' : 'Sign Out'}
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