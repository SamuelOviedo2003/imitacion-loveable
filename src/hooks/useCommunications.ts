"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Communication {
  communication_id: number
  created_at: string
  message_type: string
  summary: string | null
  recording_url: string | null
  account_id: string
  assigned_id: string | null
}

export const useCommunications = (accountId?: string) => {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunications = async () => {
    if (!accountId) {
      setCommunications([])
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // RLS policy will automatically filter by business_id based on authenticated user
      const { data, error: fetchError } = await supabase
        .from('communications')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching communications:', fetchError)
        setError(fetchError.message)
        return
      }

      setCommunications(data || [])
    } catch (err) {
      console.error('Unexpected error fetching communications:', err)
      setError('Failed to fetch communications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunications()
  }, [accountId])

  return {
    communications,
    loading,
    error,
    refetch: fetchCommunications
  }
}