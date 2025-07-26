"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface IncomingCall {
  incoming_call_id: number
  created_at: string
  account_id?: string
  duration?: number
  assigned?: string
  assigned_id?: string
  source?: string
  caller_type?: string
  recording_url?: string
  business_id?: number
  transcription?: string
  call_summary?: string
  notes?: string
  next_step?: string
  local_call?: boolean
  status?: string
}

export interface ChartData {
  name: string
  value: number
  percentage: number
  color?: string
}

export interface SankeyNode {
  id: string
  name: string
}

export interface SankeyLink {
  source: string
  target: string
  value: number
}

export interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

export const useIncomingCallsData = (userId?: string, timePeriod: number = 30) => {
  const [calls, setCalls] = useState<IncomingCall[]>([])
  const [sourceData, setSourceData] = useState<ChartData[]>([])
  const [callerTypeData, setCallerTypeData] = useState<ChartData[]>([])
  const [sankeyData, setSankeyData] = useState<SankeyData>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const generateVibrantColors = (count: number): string[] => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ]
    
    if (count <= colors.length) {
      return colors.slice(0, count)
    }
    
    // Generate additional colors if needed
    const additionalColors = []
    for (let i = 0; i < count - colors.length; i++) {
      const hue = (360 / (count - colors.length)) * i
      additionalColors.push(`hsl(${hue}, 70%, 50%)`)
    }
    
    return [...colors, ...additionalColors]
  }

  const processData = (callsData: IncomingCall[]) => {
    if (callsData.length === 0) {
      setSourceData([])
      setCallerTypeData([])
      setSankeyData({ nodes: [], links: [] })
      return
    }

    const totalCalls = callsData.length

    // Process source distribution
    const sourceCounts = callsData.reduce((acc, call) => {
      const source = call.source?.trim() || 'Unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sourceColors = generateVibrantColors(Object.keys(sourceCounts).length)
    const sourceChartData = Object.entries(sourceCounts)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: Math.round((value / totalCalls) * 100),
        color: sourceColors[index]
      }))
      .sort((a, b) => b.value - a.value)

    setSourceData(sourceChartData)

    // Process caller type distribution
    const callerTypeCounts = callsData.reduce((acc, call) => {
      const callerType = call.caller_type?.trim() || 'Unknown'
      acc[callerType] = (acc[callerType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const callerTypeColors = generateVibrantColors(Object.keys(callerTypeCounts).length)
    const callerTypeChartData = Object.entries(callerTypeCounts)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: Math.round((value / totalCalls) * 100),
        color: callerTypeColors[index]
      }))
      .sort((a, b) => b.value - a.value)

    setCallerTypeData(callerTypeChartData)

    // Process sankey data (source to caller type relationships)
    const relationships = callsData.reduce((acc, call) => {
      const source = call.source?.trim() || 'Unknown'
      const callerType = call.caller_type?.trim() || 'Unknown' 
      const key = `${source}→${callerType}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Create unique nodes for sources and caller types
    const uniqueSources = new Set(callsData.map(call => call.source?.trim() || 'Unknown'))
    const sourceNodes = Array.from(uniqueSources).map(source => ({ id: source, name: source }))
    
    const uniqueCallerTypes = new Set(callsData.map(call => call.caller_type?.trim() || 'Unknown'))
    const callerTypeNodes = Array.from(uniqueCallerTypes).map(callerType => ({ id: callerType, name: callerType }))

    const nodes = [...sourceNodes, ...callerTypeNodes]

    const links = Object.entries(relationships)
      .map(([key, value]) => {
        const [source, target] = key.split('→')
        return { source, target, value }
      })
      .sort((a, b) => b.value - a.value)

    setSankeyData({ nodes, links })
  }

  const fetchData = async () => {
    try {
      console.log('🔍 [useIncomingCallsData] Starting fetch...', { userId, timePeriod })
      setLoading(true)
      setError(null)

      if (!userId) {
        setError('No user ID provided')
        return
      }

      // Calculate date range
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timePeriod)
      const startDateISO = startDate.toISOString()

      console.log('📅 [useIncomingCallsData] Date range:', { 
        timePeriod, 
        startDate: startDateISO,
        endDate: new Date().toISOString() 
      })

      // Fetch incoming_calls data (RLS policy will automatically filter by business_id)
      const { data: callsData, error: callsError } = await supabase
        .from('incoming_calls')
        .select('*')
        .gte('created_at', startDateISO)
        .order('created_at', { ascending: false })

      if (callsError) {
        console.error('❌ [useIncomingCallsData] Error:', callsError)
        setError(`Error fetching incoming calls: ${callsError.message}`)
        return
      }

      console.log('✅ [useIncomingCallsData] Fetched', callsData?.length || 0, 'incoming calls')
      
      const calls = callsData || []
      setCalls(calls)
      processData(calls)

    } catch (err) {
      console.error('💥 [useIncomingCallsData] Unexpected error:', err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [userId, timePeriod])

  return {
    calls,
    sourceData,
    callerTypeData,
    sankeyData,
    loading,
    error,
    refetch: fetchData
  }
}