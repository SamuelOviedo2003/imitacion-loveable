"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useBusinessData = (userId?: string) => {
  const [businessData, setBusinessData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchBusinessData = async (userId: string) => {
    try {
      // Get user's business_id from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('business_id')
        .eq('id', userId)
        .single()
      
      if (!profileError && profileData?.business_id) {
        // Get business data using the business_id from profiles
        const { data: businessDataResult, error: businessError } = await supabase
          .from('business_clients')
          .select('*')
          .eq('business_id', profileData.business_id)
          .single()
        
        if (!businessError && businessDataResult) {
          setBusinessData(businessDataResult)
          return businessDataResult.business_id
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
    }
    return null
  }

  useEffect(() => {
    if (userId) {
      fetchBusinessData(userId).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [userId])

  return { businessData, loading, refetch: () => userId && fetchBusinessData(userId) }
}