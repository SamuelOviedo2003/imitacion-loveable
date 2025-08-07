"use client"

import React, { useState, useEffect } from 'react'
import { Activity, Database, Clock, AlertTriangle, X, Minimize2, Maximize2 } from 'lucide-react'
import { PerformanceMonitor, MemoryLeakDetector } from '@/lib/performance'
import { supabase } from '@/lib/supabaseOptimized'

interface PerformanceDebuggerProps {
  enabled?: boolean
}

export default function PerformanceDebugger({ enabled = false }: PerformanceDebuggerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [metrics, setMetrics] = useState<any>({})
  const [memorySnapshots, setMemorySnapshots] = useState<any[]>([])
  const [objectCounts, setObjectCounts] = useState<any>({})
  const [supabaseStats, setSupabaseStats] = useState<any>({})

  // Show debugger in development or when explicitly enabled
  const shouldShow = enabled || process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!shouldShow) return

    const monitor = PerformanceMonitor.getInstance()
    
    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      setMetrics(monitor.getMetrics())
      setMemorySnapshots(monitor.getMemorySnapshots())
      setObjectCounts(MemoryLeakDetector.getCounts())
      
      // Safely get Supabase stats
      try {
        if (supabase.isAvailable) {
          setSupabaseStats(supabase.getStats())
        }
      } catch (error) {
        console.warn('Failed to get Supabase stats:', error)
        setSupabaseStats({})
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [shouldShow])

  if (!shouldShow) return null

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMemoryTrend = () => {
    if (memorySnapshots.length < 2) return 'stable'
    const recent = memorySnapshots.slice(-5)
    const trend = recent[recent.length - 1].used - recent[0].used
    if (trend > 10) return 'increasing'
    if (trend < -10) return 'decreasing'
    return 'stable'
  }

  const hasMemoryLeaks = () => {
    return Object.values(objectCounts).some((count: any) => count > 50)
  }

  const hasSlowOperations = () => {
    const slowRenders = metrics['render.slow'] || []
    const slowMounts = metrics['mount.slow'] || []
    return slowRenders.length > 0 || slowMounts.length > 0
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'top-4 right-4'} z-50 bg-white rounded-lg shadow-2xl border border-gray-200 ${isMinimized ? 'w-80' : 'w-96'} max-h-96 overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
          {(hasMemoryLeaks() || hasSlowOperations()) && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-4 overflow-y-auto max-h-80">
          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-gray-900">Memory Usage</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                getMemoryTrend() === 'increasing' ? 'bg-red-100 text-red-700' :
                getMemoryTrend() === 'decreasing' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {getMemoryTrend()}
              </span>
            </div>
            {memorySnapshots.length > 0 && (
              <div className="text-sm space-y-1">
                <div>Current: {memorySnapshots[memorySnapshots.length - 1]?.used || 0} MB</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (memorySnapshots[memorySnapshots.length - 1]?.used || 0) > 200 ? 'bg-red-500' :
                      (memorySnapshots[memorySnapshots.length - 1]?.used || 0) > 100 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((memorySnapshots[memorySnapshots.length - 1]?.used || 0) / 300 * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Object Counts */}
          {Object.keys(objectCounts).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Tracked Objects</h4>
              <div className="text-sm space-y-1">
                {Object.entries(objectCounts).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-gray-600">{type}:</span>
                    <span className={count > 50 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supabase Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Supabase</h4>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Connections:</span>
                <span className="text-gray-900">{supabaseStats.activeConnections || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Size:</span>
                <span className="text-gray-900">{supabaseStats.cacheSize || 0}</span>
              </div>
            </div>
          </div>

          {/* Performance Warnings */}
          {(hasMemoryLeaks() || hasSlowOperations()) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h4 className="font-medium text-red-900">Performance Issues</h4>
              </div>
              <div className="text-sm space-y-1">
                {hasMemoryLeaks() && (
                  <div className="text-red-600">Memory leak detected in tracked objects</div>
                )}
                {hasSlowOperations() && (
                  <div className="text-red-600">Slow renders/mounts detected</div>
                )}
              </div>
            </div>
          )}

          {/* Recent Metrics */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <h4 className="font-medium text-gray-900">Recent Activity</h4>
            </div>
            <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
              {Object.entries(metrics)
                .filter(([key]) => !key.startsWith('render.excessive'))
                .slice(-5)
                .map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 truncate">{key}:</span>
                    <span className="text-gray-900">
                      {Array.isArray(value) ? value.length : String(value).slice(0, 20)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}