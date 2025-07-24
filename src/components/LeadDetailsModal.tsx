"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { 
  calculateTimeSince, 
  formatName, 
  formatUrgency, 
  formatService, 
  formatAddress, 
  generateGoogleMapsUrl,
  formatDuration 
} from "@/lib/leadUtils"

interface LeadDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  lead: any
}

interface CallAttempt {
  id: string
  assigned: string
  call_number: number
  duration: number
  created_at: string
}

export default function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
  const [callAttempts, setCallAttempts] = useState<CallAttempt[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && lead) {
      fetchCallAttempts()
    }
  }, [isOpen, lead])

  const fetchCallAttempts = async () => {
    if (!lead?.lead_id) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads_calls')
        .select('*')
        .eq('lead_id', lead.lead_id)
        .order('created_at', { ascending: true })

      if (!error && data) {
        // Add call numbers based on order
        const numberedCalls = data.map((call, index) => ({
          ...call,
          call_number: index + 1
        }))
        setCallAttempts(numberedCalls)
      }
    } catch (error) {
      console.error('Error fetching call attempts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !lead) return null

  const timeSinceLead = calculateTimeSince(lead.created_at)
  const leadName = formatName(lead)
  const { urgency } = formatUrgency(lead)
  const service = formatService(lead)
  const address = formatAddress(lead)
  const googleMapsUrl = generateGoogleMapsUrl(address)

  const formatAppointmentDate = (lead: any) => {
    if (lead.start_time) {
      return new Date(lead.start_time).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    return ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lead Details</h2>
            <p className="text-sm text-gray-500 mt-1">Time Since Lead: {timeSinceLead}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Lead Information & Contact Information - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lead Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Lead Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="text-gray-900">{leadName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">How Soon:</span>
                  <span className="text-gray-900">{urgency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Service:</span>
                  <span className="text-gray-900">{service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">House Value:</span>
                  <span className="text-gray-900">{lead.house_value || lead.property_value || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Distance:</span>
                  <span className="text-gray-900">{lead.distance || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Appointment Date:</span>
                  <span className="text-gray-900">{formatAppointmentDate(lead)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-gray-900">{lead.email || lead.customer_email || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="text-gray-900">{lead.phone || lead.phone_number || ''}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 font-medium">Address:</span>
                  <span className="text-gray-900 text-right max-w-xs">{address}</span>
                </div>
                {address && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Google Maps:</span>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      View on Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Call Attempts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Call Attempts
            </h3>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading call attempts...</div>
            ) : callAttempts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Agent</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callAttempts.map((call, index) => (
                      <tr key={call.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{call.assigned || 'Unknown'}</td>
                        <td className="py-3 px-4 text-gray-900">{call.call_number}</td>
                        <td className="py-3 px-4 text-gray-900">{formatDuration(call.duration)}</td>
                        <td className="py-3 px-4 text-gray-900">{calculateTimeSince(call.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No call attempts recorded for this lead.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}