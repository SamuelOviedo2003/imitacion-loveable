"use client"

import React, { useState, useEffect, useRef } from 'react'
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import LoadingScreen from './LoadingScreen'
import { usePerformanceMonitor } from '@/lib/performance'

interface IntelligentLoaderProps {
  loading: boolean
  error?: Error | null
  onRetry?: () => void
  minLoadTime?: number
  maxLoadTime?: number
  fallbackComponent?: React.ReactNode
  loadingMessage?: string
  errorMessage?: string
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function IntelligentLoader({
  loading,
  error,
  onRetry,
  minLoadTime = 500,
  maxLoadTime = 30000,
  fallbackComponent,
  loadingMessage = "Loading...",
  errorMessage,
  showProgress = true,
  size = 'md'
}: IntelligentLoaderProps) {
  const { recordMetric } = usePerformanceMonitor('IntelligentLoader')
  const [showLoader, setShowLoader] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isStuck, setIsStuck] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [estimatedTime, setEstimatedTime] = useState(0)
  
  const startTimeRef = useRef<number>(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const stuckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const minTimeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      recordMetric('network.online', { retryCount })
    }
    const handleOffline = () => {
      setIsOnline(false)
      recordMetric('network.offline', { loadingTime: Date.now() - startTimeRef.current })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [recordMetric, retryCount])

  // Enhanced loading state management
  useEffect(() => {
    if (loading) {
      startTimeRef.current = Date.now()
      setProgress(0)
      setIsStuck(false)
      recordMetric('loading.start', { retryCount })
      
      // Show loader after minLoadTime to avoid flashing
      if (minTimeTimeoutRef.current) clearTimeout(minTimeTimeoutRef.current)
      minTimeTimeoutRef.current = setTimeout(() => {
        setShowLoader(true)
      }, minLoadTime)

      // Start progress simulation
      if (showProgress && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      
      if (showProgress) {
        progressIntervalRef.current = setInterval(() => {
          setProgress(prev => {
            const elapsed = Date.now() - startTimeRef.current
            const expectedProgress = Math.min((elapsed / estimatedTime) * 80, 90) // Cap at 90% until actual completion
            return Math.max(prev, expectedProgress)
          })
        }, 100)
      }

      // Detect stuck loading after maxLoadTime
      if (stuckTimeoutRef.current) clearTimeout(stuckTimeoutRef.current)
      stuckTimeoutRef.current = setTimeout(() => {
        setIsStuck(true)
        recordMetric('loading.stuck', { 
          duration: Date.now() - startTimeRef.current,
          retryCount,
          isOnline 
        })
      }, maxLoadTime)

      // Estimate loading time based on previous loads
      const previousLoads = JSON.parse(localStorage.getItem('loadTimes') || '[]')
      const avgLoadTime = previousLoads.length > 0 
        ? previousLoads.reduce((a: number, b: number) => a + b, 0) / previousLoads.length
        : 3000 // Default 3 seconds
      setEstimatedTime(avgLoadTime)

    } else {
      // Loading finished
      if (showLoader && startTimeRef.current > 0) {
        const loadTime = Date.now() - startTimeRef.current
        recordMetric('loading.complete', { 
          duration: loadTime,
          retryCount,
          wasStuck: isStuck 
        })

        // Store load time for future estimates
        const previousLoads = JSON.parse(localStorage.getItem('loadTimes') || '[]')
        const newLoads = [...previousLoads.slice(-9), loadTime] // Keep last 10 load times
        localStorage.setItem('loadTimes', JSON.stringify(newLoads))

        // Complete progress
        setProgress(100)
        
        // Hide loader after a brief moment
        setTimeout(() => {
          setShowLoader(false)
          setProgress(0)
        }, 200)
      }

      // Clear all timeouts
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (stuckTimeoutRef.current) {
        clearTimeout(stuckTimeoutRef.current)
        stuckTimeoutRef.current = null
      }
      if (minTimeTimeoutRef.current) {
        clearTimeout(minTimeTimeoutRef.current)
        minTimeTimeoutRef.current = null
      }
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (stuckTimeoutRef.current) clearTimeout(stuckTimeoutRef.current)
      if (minTimeTimeoutRef.current) clearTimeout(minTimeTimeoutRef.current)
    }
  }, [loading, minLoadTime, maxLoadTime, showProgress, recordMetric, retryCount, isStuck, isOnline])

  // Error recovery
  const handleRetry = () => {
    const newRetryCount = retryCount + 1
    setRetryCount(newRetryCount)
    setIsStuck(false)
    recordMetric('loading.retry', { retryCount: newRetryCount, isOnline })
    
    if (onRetry) {
      onRetry()
    }
  }

  // Auto-retry when back online
  useEffect(() => {
    if (isOnline && error && retryCount < 3) {
      const autoRetryTimeout = setTimeout(() => {
        handleRetry()
      }, 2000)
      return () => clearTimeout(autoRetryTimeout)
    }
  }, [isOnline, error, retryCount])

  // Error state
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          {!isOnline ? <WifiOff className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <h3 className="text-lg font-semibold">
            {!isOnline ? 'Connection Lost' : 'Loading Error'}
          </h3>
        </div>
        
        <p className="text-gray-600 text-center max-w-md">
          {errorMessage || error.message || (!isOnline 
            ? 'Please check your internet connection and try again.'
            : 'Something went wrong while loading. Please try again.'
          )}
        </p>

        {retryCount > 0 && (
          <p className="text-sm text-gray-500">
            Retry attempt {retryCount} of 3
          </p>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleRetry}
            disabled={!onRetry || (!isOnline && retryCount >= 3)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  // Loading state with enhanced UX
  if (showLoader || loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <LoadingScreen 
          message={loadingMessage}
          size={size}
          showMessage={true}
        />

        {showProgress && (
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Loading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            {estimatedTime > 0 && !isStuck && (
              <div className="text-xs text-gray-500 text-center">
                Estimated time: {Math.round((estimatedTime - (Date.now() - startTimeRef.current)) / 1000)}s
              </div>
            )}
          </div>
        )}

        {isStuck && (
          <div className="text-center space-y-2">
            <p className="text-yellow-600 text-sm">
              This is taking longer than expected...
            </p>
            {onRetry && (
              <button
                onClick={handleRetry}
                className="text-blue-600 text-sm hover:text-blue-700 underline"
              >
                Try refreshing
              </button>
            )}
          </div>
        )}

        {!isOnline && (
          <div className="flex items-center space-x-2 text-orange-600 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Waiting for connection...</span>
          </div>
        )}
      </div>
    )
  }

  // Return fallback component if provided
  return fallbackComponent ? <>{fallbackComponent}</> : null
}