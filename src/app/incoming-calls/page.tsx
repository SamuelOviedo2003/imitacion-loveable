"use client"

import { useState, lazy, Suspense, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import ProtectedLayout from "@/components/ProtectedLayout"
import LoadingScreen from "@/components/LoadingScreen"
import { ErrorBoundary } from "@/components/ErrorBoundary"
// Lazy load heavy chart components with better error handling
const SourceDistributionChart = lazy(() => import("@/components/SourceDistributionChart").catch(() => ({ default: () => <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Chart failed to load</div> })))
const CallerTypeDistributionChart = lazy(() => import("@/components/CallerTypeDistributionChart").catch(() => ({ default: () => <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Chart failed to load</div> })))
const SourceToCallerTypeSankey = lazy(() => import("@/components/SourceToCallerTypeSankey").catch(() => ({ default: () => <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Diagram failed to load</div> })))
const RecentIncomingCallsTable = lazy(() => import("@/components/RecentIncomingCallsTable").catch(() => ({ default: () => <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Table failed to load</div> })))
import { useAuth } from "@/contexts/AuthContext"
import { useIncomingCallsData } from "@/hooks/useIncomingCallsData"

export default function IncomingCallsPage() {
  const { businessData } = useAuth()
  const [timePeriod, setTimePeriod] = useState(30)

  const businessId = businessData?.business_id

  const {
    calls,
    sourceData,
    callerTypeData,
    sankeyData,
    loading,
    error
  } = useIncomingCallsData(businessId, timePeriod)

  // Optimize loading fallbacks with better UX
  const loadingFallback = useMemo(() => (
    <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
      <LoadingScreen 
        message="Loading chart..."
        size="md"
        showMessage={false}
      />
    </div>
  ), [])

  const tableLoadingFallback = useMemo(() => (
    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
      <LoadingScreen 
        message="Loading table..."
        size="md"
        showMessage={false}
      />
    </div>
  ), [])

  // Show skeleton UI instead of blocking the entire page
  const isInitialLoad = loading && !calls.length && !error


  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="container mx-auto px-6 py-6">
          <div className="space-y-6">
            {/* Modern Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Incoming Calls Analytics</h1>
                <p className="text-lg text-gray-600">Monitor and analyze your incoming call data from all sources</p>
              </div>
              
              {/* Modern Time Filter */}
              <div className="flex flex-col items-center md:items-end">
                <p className="text-sm font-medium text-gray-700 mb-3">Analysis Period</p>
                <div className="relative">
                  <select 
                    value={timePeriod} 
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    className="appearance-none modern-card bg-white border-0 shadow-md px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-200 focus:shadow-lg w-48 transition-all duration-200"
                  >
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="modern-card pastel-card-rose">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid-modern-2">
              <div className="modern-card pastel-card-mint">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Source Distribution</h3>
                  <p className="text-gray-600 text-sm">Call volume by traffic source</p>
                </div>
                <ErrorBoundary>
                  <Suspense fallback={loadingFallback}>
                    <SourceDistributionChart 
                      data={error ? [] : sourceData} 
                      loading={isInitialLoad} 
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
              
              <div className="modern-card pastel-card-lavender">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Caller Type Distribution</h3>
                  <p className="text-gray-600 text-sm">Breakdown by caller category</p>
                </div>
                <ErrorBoundary>
                  <Suspense fallback={loadingFallback}>
                    <CallerTypeDistributionChart 
                      data={error ? [] : callerTypeData} 
                      loading={isInitialLoad} 
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

            {/* Recent Calls Table */}
            <div className="modern-card">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Incoming Calls</h3>
                <p className="text-gray-600">Latest call activity and details</p>
              </div>
              <ErrorBoundary>
                <Suspense fallback={tableLoadingFallback}>
                  <RecentIncomingCallsTable 
                    calls={error ? [] : calls} 
                    loading={isInitialLoad} 
                  />
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Sankey Flow Diagram */}
            <div className="modern-card pastel-card-sky">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Source-to-Caller Flow</h3>
                <p className="text-gray-600">Visual relationship between traffic sources and caller types</p>
              </div>
              <ErrorBoundary>
                <Suspense fallback={loadingFallback}>
                  <SourceToCallerTypeSankey 
                    data={error ? { nodes: [], links: [] } : sankeyData} 
                    loading={isInitialLoad} 
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}