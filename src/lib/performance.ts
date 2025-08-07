/**
 * Performance Monitoring and Memory Leak Detection Utilities
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, any> = new Map()
  private memorySnapshots: Array<{ timestamp: number; used: number }> = []
  private observers: Map<string, PerformanceObserver> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.startMemoryMonitoring()
    }
  }

  private initializeObservers() {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(`navigation.${entry.name}`, {
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now()
          })
        }
      })
      observer.observe({ entryTypes: ['navigation'] })
      this.observers.set('navigation', observer)

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 1000) { // Log slow resources (>1s)
            console.warn(`Slow resource detected: ${entry.name} took ${entry.duration}ms`)
            this.recordMetric(`resource.slow`, {
              name: entry.name,
              duration: entry.duration,
              timestamp: Date.now()
            })
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', resourceObserver)
    }
  }

  private startMemoryMonitoring() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory
        const usedMB = Math.round(memInfo.usedJSHeapSize / 1048576)
        
        this.memorySnapshots.push({
          timestamp: Date.now(),
          used: usedMB
        })

        // Keep only last 100 snapshots
        if (this.memorySnapshots.length > 100) {
          this.memorySnapshots = this.memorySnapshots.slice(-100)
        }

        // Check for memory leaks (>50MB growth over 10 minutes)
        if (this.memorySnapshots.length >= 10) {
          const oldSnapshot = this.memorySnapshots[this.memorySnapshots.length - 10]
          const growth = usedMB - oldSnapshot.used
          
          if (growth > 50) {
            console.warn(`Memory leak detected: ${growth}MB growth in ${(Date.now() - oldSnapshot.timestamp) / 60000} minutes`)
            this.recordMetric('memory.leak', {
              growth,
              currentUsage: usedMB,
              timestamp: Date.now()
            })
          }
        }

        // Warn if memory usage is high
        if (usedMB > 200) {
          console.warn(`High memory usage: ${usedMB}MB`)
        }
      }

      // Check memory every 30 seconds
      setInterval(checkMemory, 30000)
      checkMemory() // Initial check
    }
  }

  recordMetric(key: string, value: any) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    this.metrics.get(key).push(value)

    // Keep only last 50 entries per metric
    const entries = this.metrics.get(key)
    if (entries.length > 50) {
      this.metrics.set(key, entries.slice(-50))
    }
  }

  getMetrics(key?: string) {
    if (key) {
      return this.metrics.get(key) || []
    }
    return Object.fromEntries(this.metrics.entries())
  }

  getMemorySnapshots() {
    return this.memorySnapshots
  }

  // Helper to measure component render time
  measureComponentRender<T>(componentName: string, renderFunction: () => T): T {
    const start = performance.now()
    const result = renderFunction()
    const end = performance.now()
    
    const duration = end - start
    if (duration > 16) { // Log slow renders (>1 frame at 60fps)
      console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`)
      this.recordMetric(`render.slow.${componentName}`, {
        duration,
        timestamp: Date.now()
      })
    }

    return result
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// React hook for performance monitoring
import { useEffect, useRef } from 'react'

export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance()
  const renderCount = useRef(0)
  const mountTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current++
    
    // Log excessive re-renders
    if (renderCount.current > 10) {
      console.warn(`Excessive re-renders detected: ${componentName} rendered ${renderCount.current} times`)
      monitor.recordMetric(`render.excessive.${componentName}`, {
        count: renderCount.current,
        timestamp: Date.now()
      })
    }
  })

  useEffect(() => {
    // Log mount time
    const mountDuration = performance.now() - mountTime.current
    if (mountDuration > 100) { // Log slow mounts (>100ms)
      console.warn(`Slow component mount: ${componentName} took ${mountDuration.toFixed(2)}ms`)
      monitor.recordMetric(`mount.slow.${componentName}`, {
        duration: mountDuration,
        timestamp: Date.now()
      })
    }

    return () => {
      // Log unmount
      monitor.recordMetric(`unmount.${componentName}`, {
        renderCount: renderCount.current,
        lifespan: performance.now() - mountTime.current,
        timestamp: Date.now()
      })
    }
  }, [componentName, monitor])

  return {
    recordMetric: (key: string, value: any) => monitor.recordMetric(`${componentName}.${key}`, value),
    getMetrics: () => monitor.getMetrics(),
    renderCount: renderCount.current
  }
}

// Memory leak detector for specific objects
export class MemoryLeakDetector {
  private static trackedObjects = new WeakMap()
  private static objectCounts = new Map<string, number>()

  static track(obj: any, type: string) {
    this.trackedObjects.set(obj, { type, timestamp: Date.now() })
    this.objectCounts.set(type, (this.objectCounts.get(type) || 0) + 1)
    
    // Log if we have too many objects of the same type
    const count = this.objectCounts.get(type)!
    if (count > 50) {
      console.warn(`Memory leak warning: ${count} ${type} objects tracked`)
    }
  }

  static untrack(obj: any) {
    const info = this.trackedObjects.get(obj)
    if (info) {
      this.trackedObjects.delete(obj)
      const currentCount = this.objectCounts.get(info.type) || 0
      this.objectCounts.set(info.type, Math.max(0, currentCount - 1))
    }
  }

  static getCounts() {
    return Object.fromEntries(this.objectCounts.entries())
  }
}

export default PerformanceMonitor