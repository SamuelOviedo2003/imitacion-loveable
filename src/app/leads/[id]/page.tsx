"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, ArrowLeft, Check, X } from "lucide-react"
import { supabase } from '@/lib/supabase'
import Header from "@/components/Header"
import CommunicationsTable from "@/components/CommunicationsTable"
import ChatInterface from "@/components/ChatInterface"
import { useCommunications } from "@/hooks/useCommunications"
import { useAuth } from "@/contexts/AuthContext"
import { 
  formatName, 
  formatUrgency, 
  formatService, 
  formatAddress, 
  generateGoogleMapsUrl,
  formatDateTimeInTimezone
} from "@/lib/leadUtils"

interface House {
  id: string
  address: string
  photos: string[]
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { businessData } = useAuth()
  const [lead, setLead] = useState<any>(null)
  const [houses, setHouses] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  
  const { communications, loading: communicationsLoading } = useCommunications(lead?.account_id || lead?.lead_id)

  useEffect(() => {
    fetchLeadDetails()
  }, [params.id])

  const fetchLeadDetails = async () => {
    setLoading(true)
    try {
      let leadData = null
      
      // Check if this is a mock lead
      if (params.id.startsWith('mock-lead-')) {
        // Mock data for demo purposes
        const mockLeads = [
          {
            lead_id: "mock-lead-1",
            first_name: "John",
            last_name: "Doe",
            urgency: "ASAP",
            service: "Full Replacement",
            house_value: "$450,000",
            distance_meters: 8368, // 5.2 miles in meters
            duration_seconds: 1200, // 20 minutes
            created_at: "2024-01-01T05:00:00Z",
            email: "john.doe@example.com",
            email_valid: true,
            phone: "(555) 123-4567",
            street_address: "123 Main St",
            city: "Springfield",
            state: "IL",
            zip_code: "62701",
            property_address: "123 Main St, Springfield, IL 62701",
            house_url: "/images/house.png",
            property_image_url: null,
            score: 85,
            score_summary: "High-quality lead with strong interest in metal roofing replacement. Homeowner owns valuable property and has indicated urgent timeline."
          },
          {
            lead_id: "mock-lead-2",
            first_name: "Jane",
            last_name: "Smith",
            urgency: "Within 2 weeks",
            service: "Repair",
            house_value: "$320,000",
            distance_meters: 14001, // 8.7 miles in meters
            duration_seconds: 900, // 15 minutes
            created_at: "2024-01-02T06:00:00Z",
            email: "jane.smith@example.com",
            email_valid: false,
            phone: "(555) 234-5678",
            street_address: "456 Oak Ave",
            city: "Springfield",
            state: "IL",
            zip_code: "62702",
            property_address: "456 Oak Ave, Springfield, IL 62702",
            house_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            property_image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            score: 45,
            score_summary: "Moderate lead with budget concerns. Homeowner needs minor repairs but is price-conscious. Follow up needed to determine final interest level."
          },
          {
            lead_id: "mock-lead-3",
            first_name: "David",
            last_name: "Lee",
            urgency: "Next month",
            service: "Inspection",
            house_value: "$275,000",
            distance_meters: 19472, // 12.1 miles in meters
            duration_seconds: 1800, // 30 minutes
            created_at: "2024-01-03T07:00:00Z",
            email: "david.lee@example.com",
            email_valid: true,
            phone: "(555) 345-6789",
            street_address: "789 Pine Rd",
            city: "Springfield",
            state: "IL",
            zip_code: "62703",
            property_address: "789 Pine Rd, Springfield, IL 62703",
            house_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
            property_image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
            score: 22,
            score_summary: "Initial inquiry for property inspection before sale. Homeowner is exploring options and timeline is flexible. Low urgency but legitimate need."
          }
        ]
        
        const mockLead = mockLeads.find(lead => lead.lead_id === params.id)
        if (mockLead) {
          leadData = mockLead
        } else {
          throw new Error('Mock lead not found')
        }
      } else {
        // Fetch lead details from Supabase
        const { data: supabaseLeadData, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('lead_id', params.id)
          .single()

        if (leadError) throw leadError
        
        // Also try to fetch additional property data from clients table using proper JOIN
        
        let clientData = null
        let clientError = null
        
        if (supabaseLeadData?.account_id) {
          // Method 1: Query clients table directly using account_id from the lead
          const clientQuery = await supabase
            .from('clients')
            .select('house_value, distance_meters, house_url, full_address, duration_seconds')
            .eq('account_id', supabaseLeadData.account_id)
            .single()
          
          clientData = clientQuery.data
          clientError = clientQuery.error
          
        } else {
        }
        
        if (clientError) {
          console.error('❌ [Lead Detail] Error fetching client data:', clientError)
          // Don't throw error, just log it so the page still loads with lead data
        }

        // Merge lead data with client data
        leadData = {
          ...supabaseLeadData,
          ...(clientData && {
            house_value: clientData.house_value,
            distance_meters: clientData.distance_meters,
            house_url: clientData.house_url,
            property_address: clientData.full_address, // Map full_address to property_address
            duration_seconds: clientData.duration_seconds
          })
        }
        
      }

      setLead(leadData)

      // Set property data based on lead information
      if (leadData) {
        // Use property_address if available, otherwise construct from street_address, city, state
        const address = leadData.property_address || 
          `${leadData.street_address || ''} ${leadData.city || ''} ${leadData.state || ''}`.trim() || 
          'Property Address'
        
        // Use house_url with fallback to noIMAGE.png
        const propertyImageUrl = leadData.house_url || leadData.property_image_url || '/images/noIMAGE.png'
        
        
        setHouses([{
          id: '1',
          address: address,
          photos: [propertyImageUrl]
        }])
      }

    } catch (error) {
      console.error('Error fetching lead details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAppointmentDate = (lead: any) => {
    if (lead?.start_time) {
      return formatDateTimeInTimezone(lead.start_time, businessData?.time_zone, {
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

  const formatDistance = (distanceMeters: number) => {
    if (!distanceMeters) return 'N/A'
    const miles = (distanceMeters * 0.000621371).toFixed(1)
    return `${miles} mi`
  }

  const formatDuration = (durationSeconds: number) => {
    if (!durationSeconds) return 'N/A'
    const minutes = Math.round(durationSeconds / 60)
    return `${minutes} min`
  }

  const getScoreBackgroundColor = (score: number | null) => {
    if (!score || score < 0) return 'bg-gray-100 border-gray-200'
    
    if (score <= 33) {
      return 'bg-red-100 border-red-200'
    } else if (score <= 66) {
      return 'bg-yellow-100 border-yellow-200'
    } else {
      return 'bg-green-100 border-green-200'
    }
  }

  const getScoreTextColor = (score: number | null) => {
    if (!score || score < 0) return 'text-gray-600'
    
    if (score <= 33) {
      return 'text-red-700'
    } else if (score <= 66) {
      return 'text-yellow-700'
    } else {
      return 'text-green-700'
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead details...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lead not found</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const leadName = formatName(lead)
  const { urgency } = formatUrgency(lead)
  const service = formatService(lead)
  // Use property_address first (from clients.full_address), then fall back to formatAddress for individual components
  const address = lead.property_address || formatAddress(lead)
  const googleMapsUrl = generateGoogleMapsUrl(address)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Modern Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/new-leads')}
            className="modern-button-secondary flex items-center gap-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to New Leads</span>
          </button>
        </div>
        
        <div className="space-y-10">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Lead Details</h1>
            <p className="text-lg text-gray-600">Complete overview of lead information and communications</p>
          </div>

          {/* Top Row: Lead Info + Property Image */}
          <div className="grid-modern-2">
            {/* Lead Information Card */}
            <div className="modern-card pastel-card-peach space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{leadName}</h2>
                <p className="text-gray-600 text-sm">Lead Information & Contact Details</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-orange-100/50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700">{lead.email || lead.customer_email || 'No email provided'}</span>
                      {lead.email_valid ? (
                        <div className="p-1 bg-green-100 rounded-full">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-1 bg-red-100 rounded-full">
                          <X className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700">{lead.phone || lead.phone_number || 'No phone provided'}</p>
                  </div>
                </div>

                {/* Address */}
                {address && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-orange-100/50">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      Property Address
                    </h4>
                    <p className="text-gray-700 mb-4">{address}</p>
                    
                    {/* Distance and Duration */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Distance</p>
                        <p className="text-lg font-bold text-orange-600">{formatDistance(lead.distance_meters) || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                        <p className="text-lg font-bold text-orange-600">{formatDuration(lead.duration_seconds) || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modern-button-secondary inline-flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Maps
                    </a>
                  </div>
                )}

                {/* Lead Details Grid */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-orange-100/50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    Service Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Service Needed</p>
                      <p className="text-sm font-semibold text-gray-900">{service}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">How Soon</p>
                      <p className="text-sm font-semibold text-gray-900">{urgency}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Setter Name</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.setter_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Roof Age</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.roof_age || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Payment Type</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.payment_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Source</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.source || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-orange-100/50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    Appointment
                  </h4>
                  <p className="text-gray-700">{formatAppointmentDate(lead) || 'Not scheduled'}</p>
                </div>
              </div>
            </div>

            {/* Property Image and Score Card */}
            <div className="modern-card pastel-card-sky space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Property & Score</h3>
                <p className="text-gray-600">Visual overview and lead quality assessment</p>
              </div>

              {/* Property Image */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-sky-100/50">
                <div className="relative h-64 bg-gray-50 rounded-xl overflow-hidden">
                  {houses.length > 0 && houses[0].photos.length > 0 ? (
                    <img
                      src={houses[0].photos[0]}
                      alt="Property"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/noIMAGE.png';
                      }}
                    />
                  ) : (
                    <img
                      src="/images/noIMAGE.png"
                      alt="No Property Image"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              
              {/* Score Section */}
              <div className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 border ${getScoreBackgroundColor(lead.score).includes('red') ? 'border-red-200/50' : getScoreBackgroundColor(lead.score).includes('yellow') ? 'border-yellow-200/50' : 'border-green-200/50'} text-center`}>
                <div className="mb-6">
                  <div className={`text-5xl font-bold mb-2 ${getScoreTextColor(lead.score)}`}>
                    {lead.score ? `${lead.score}%` : 'N/A'}
                  </div>
                  <div className={`text-sm font-medium uppercase tracking-wider ${getScoreTextColor(lead.score)}`}>
                    Lead Quality Score
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <p className="text-sm leading-relaxed text-gray-700">
                    {lead.score_summary || 'No detailed score analysis available for this lead.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Communications Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Communications History</h3>
              <p className="text-gray-600">All interactions and messages with this lead</p>
            </div>
            
            <CommunicationsTable 
              communications={communications} 
              loading={communicationsLoading} 
            />
            
            {/* Message Input Section */}
            <div className="modern-card">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Send New Message</h4>
                <p className="text-sm text-gray-600">Compose and send a message to this lead</p>
              </div>
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}