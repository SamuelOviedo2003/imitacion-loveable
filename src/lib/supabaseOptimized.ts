/**
 * Optimized Supabase Client with Connection Pooling and Request Deduplication
 */

import { createClient } from '@supabase/supabase-js'
import { MemoryLeakDetector } from './performance'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create base client only if environment variables are available
const baseClient = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null

// Request deduplication cache
class RequestCache {
  private cache = new Map<string, Promise<any>>()
  private timeouts = new Map<string, NodeJS.Timeout>()

  get(key: string) {
    return this.cache.get(key)
  }

  set(key: string, promise: Promise<any>, ttl = 5000) {
    this.cache.set(key, promise)
    
    // Clear existing timeout
    const existingTimeout = this.timeouts.get(key)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.cache.delete(key)
      this.timeouts.delete(key)
    }, ttl)
    
    this.timeouts.set(key, timeout)

    // Track for memory leaks
    MemoryLeakDetector.track(promise, 'supabase-request')

    return promise
  }

  clear() {
    this.timeouts.forEach(timeout => clearTimeout(timeout))
    this.cache.clear()
    this.timeouts.clear()
  }

  get size() {
    return this.cache.size
  }
}

// Global request cache
const requestCache = new RequestCache()

// Connection pool manager
class ConnectionManager {
  private activeConnections = new Set<AbortController>()
  private connectionCount = 0
  private readonly maxConnections = 10

  createConnection(): AbortController {
    if (this.connectionCount >= this.maxConnections) {
      console.warn(`Max connections (${this.maxConnections}) reached, some requests may be slow`)
    }

    const controller = new AbortController()
    this.activeConnections.add(controller)
    this.connectionCount++

    // Track connection
    MemoryLeakDetector.track(controller, 'supabase-connection')

    // Auto-cleanup after 30 seconds
    setTimeout(() => {
      this.releaseConnection(controller)
    }, 30000)

    return controller
  }

  releaseConnection(controller: AbortController) {
    if (this.activeConnections.has(controller)) {
      this.activeConnections.delete(controller)
      this.connectionCount--
      MemoryLeakDetector.untrack(controller)
    }
  }

  cleanup() {
    this.activeConnections.forEach(controller => {
      controller.abort()
      this.releaseConnection(controller)
    })
    requestCache.clear()
  }

  getStats() {
    return {
      activeConnections: this.activeConnections.size,
      connectionCount: this.connectionCount,
      cacheSize: requestCache.size
    }
  }
}

const connectionManager = new ConnectionManager()

// Enhanced Supabase client with optimizations
export class OptimizedSupabaseClient {
  private client = baseClient

  // Check if client is available
  get isAvailable() {
    return this.client !== null
  }

  // Optimized select with deduplication
  from(table: string) {
    if (!this.client) {
      throw new Error('Supabase client not available - check environment variables')
    }
    return {
      select: (columns = '*') => {
        return {
          eq: (column: string, value: any) => this.optimizedQuery(table, columns, { [column]: value }),
          gte: (column: string, value: any) => this.optimizedQuery(table, columns, { [`${column}__gte`]: value }),
          lte: (column: string, value: any) => this.optimizedQuery(table, columns, { [`${column}__lte`]: value }),
          in: (column: string, values: any[]) => this.optimizedQuery(table, columns, { [`${column}__in`]: values }),
          order: (column: string, options?: { ascending?: boolean }) => 
            this.optimizedQuery(table, columns, {}, { orderBy: column, ascending: options?.ascending }),
          limit: (count: number) => this.optimizedQuery(table, columns, {}, { limit: count }),
          single: () => this.optimizedQuery(table, columns, {}, { single: true }),
          // Execute the query
          then: (resolve: (result: any) => void, reject?: (error: any) => void) => {
            return this.optimizedQuery(table, columns).then(resolve, reject)
          }
        }
      },
      
      // Regular supabase methods for non-cached operations
      insert: (values: any) => {
        if (!this.client) throw new Error('Supabase client not available')
        return this.client.from(table).insert(values)
      },
      update: (values: any) => ({
        eq: (column: string, value: any) => {
          if (!this.client) throw new Error('Supabase client not available')
          return this.client.from(table).update(values).eq(column, value)
        }
      }),
      delete: () => ({
        eq: (column: string, value: any) => {
          if (!this.client) throw new Error('Supabase client not available')
          return this.client.from(table).delete().eq(column, value)
        }
      })
    }
  }

  private async optimizedQuery(
    table: string, 
    columns: string, 
    filters: Record<string, any> = {},
    options: Record<string, any> = {}
  ) {
    // Create cache key
    const cacheKey = JSON.stringify({ table, columns, filters, options })
    
    // Check cache first
    const cachedResult = requestCache.get(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    // Create new request
    const controller = connectionManager.createConnection()
    
    const queryPromise = (async () => {
      try {
        if (!this.client) {
          throw new Error('Supabase client not available')
        }
        let query = this.client.from(table).select(columns)
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (key.endsWith('__gte')) {
            const column = key.replace('__gte', '')
            query = query.gte(column, value)
          } else if (key.endsWith('__lte')) {
            const column = key.replace('__lte', '')
            query = query.lte(column, value)
          } else if (key.endsWith('__in')) {
            const column = key.replace('__in', '')
            query = query.in(column, value)
          } else {
            query = query.eq(key, value)
          }
        })

        // Apply options
        if (options.orderBy) {
          query = query.order(options.orderBy, { ascending: options.ascending !== false })
        }
        if (options.limit) {
          query = query.limit(options.limit)
        }

        const result = options.single ? await query.single() : await query

        connectionManager.releaseConnection(controller)
        return result

      } catch (error) {
        connectionManager.releaseConnection(controller)
        throw error
      }
    })()

    // Cache the promise
    requestCache.set(cacheKey, queryPromise, 3000) // 3 second cache

    return queryPromise
  }

  // Auth methods (not cached)
  get auth() {
    if (!this.client) {
      throw new Error('Supabase client not available - check environment variables')
    }
    return this.client.auth
  }

  // Direct client access for complex queries
  get raw() {
    if (!this.client) {
      throw new Error('Supabase client not available - check environment variables')
    }
    return this.client
  }

  // Cleanup method
  cleanup() {
    connectionManager.cleanup()
  }

  // Statistics
  getStats() {
    return connectionManager.getStats()
  }
}

// Create singleton instance
export const supabase = new OptimizedSupabaseClient()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabase.cleanup()
  })
}

export default supabase