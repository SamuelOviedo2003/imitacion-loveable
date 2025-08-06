"use client"

import { useState, lazy, Suspense, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import ProtectedLayout from "@/components/ProtectedLayout"
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
    <div className="h-80 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading...</div>
    </div>
  ), [])

  const tableLoadingFallback = useMemo(() => (
    <div className="h-64 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading table...</div>
    </div>
  ), [])

  // Show skeleton UI instead of blocking the entire page
  const isInitialLoad = loading && !calls.length && !error


  return (
    <ProtectedLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header with Time Filter */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Incoming Calls</h1>
              <p className="text-gray-600">Monitor and analyze your lead data from all sources</p>
            </div>
            
            {/* Global Time Filter */}
            <div className="flex flex-col items-end">
              <p className="text-sm text-gray-500 mb-2">Time Period</p>
              <div className="relative">
                <select 
                  value={timePeriod} 
                  onChange={(e) => setTimePeriod(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
                >
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800 font-medium">Error loading data</div>
              <div className="text-red-600 text-sm mt-1">{error}</div>
            </div>
          )}


          {/* Charts Grid - Always render with progressive loading */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ErrorBoundary>
              <Suspense fallback={loadingFallback}>
                <SourceDistributionChart 
                  data={error ? [] : sourceData} 
                  loading={isInitialLoad} 
                />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
              <Suspense fallback={loadingFallback}>
                <CallerTypeDistributionChart 
                  data={error ? [] : callerTypeData} 
                  loading={isInitialLoad} 
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Recent Incoming Calls Table - Always render */}
          <ErrorBoundary>
            <Suspense fallback={tableLoadingFallback}>
              <RecentIncomingCallsTable 
                calls={error ? [] : calls} 
                loading={isInitialLoad} 
              />
            </Suspense>
          </ErrorBoundary>

          {/* Sankey Diagram - Always render */}
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
    </ProtectedLayout>
  )
}