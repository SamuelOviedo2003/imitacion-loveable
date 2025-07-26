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

export interface SankeyLink {
  source: string
  target: string
  value: number
}

export const useIncomingCallsData = (userId?: string, timePeriod: number = 30) => {
  const [calls, setCalls] = useState<IncomingCall[]>([])
  const [sourceData, setSourceData] = useState<ChartData[]>([])
  const [callerTypeData, setCallerTypeData] = useState<ChartData[]>([])
  const [sankeyData, setSankeyData] = useState<SankeyLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const processData = (callsData: IncomingCall[]) => {
    if (callsData.length === 0) {
      setSourceData([])
      setCallerTypeData([])
      setSankeyData([])
      return
    }

    const totalCalls = callsData.length

    // Process source distribution
    const sourceCounts = callsData.reduce((acc, call) => {
      const source = call.source?.trim() || 'Unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sourceChartData = Object.entries(sourceCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalCalls) * 100)
      }))
      .sort((a, b) => b.value - a.value)

    setSourceData(sourceChartData)

    // Process caller type distribution
    const callerTypeCounts = callsData.reduce((acc, call) => {
      const callerType = call.caller_type?.trim() || 'Unknown'
      acc[callerType] = (acc[callerType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const callerTypeChartData = Object.entries(callerTypeCounts)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalCalls) * 100)
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

    const sankeyLinks = Object.entries(relationships)
      .map(([key, value]) => {
        const [source, target] = key.split('→')
        return { source, target, value }
      })
      .sort((a, b) => b.value - a.value)

    setSankeyData(sankeyLinks)
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