"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from '@/lib/supabase'
import Header from "@/components/Header"
import CommunicationsTable from "@/components/CommunicationsTable"
import ChatInterface from "@/components/ChatInterface"
import { useCommunications } from "@/hooks/useCommunications"
import { 
  calculateTimeSince, 
  formatName, 
  formatUrgency, 
  formatService, 
  formatAddress, 
  generateGoogleMapsUrl
} from "@/lib/leadUtils"

interface House {
  id: string
  address: string
  photos: string[]
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [lead, setLead] = useState<any>(null)
  const [houses, setHouses] = useState<House[]>([])
  const [currentHouseIndex, setCurrentHouseIndex] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
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
            phone: "(555) 123-4567",
            street_address: "123 Main St",
            city: "Springfield",
            state: "IL",
            zip_code: "62701",
            property_address: "123 Main St, Springfield, IL 62701",
            house_url: "/images/house.png",
            property_image_url: null
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
            phone: "(555) 234-5678",
            street_address: "456 Oak Ave",
            city: "Springfield",
            state: "IL",
            zip_code: "62702",
            property_address: "456 Oak Ave, Springfield, IL 62702",
            house_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
            property_image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
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
            phone: "(555) 345-6789",
            street_address: "789 Pine Rd",
            city: "Springfield",
            state: "IL",
            zip_code: "62703",
            property_address: "789 Pine Rd, Springfield, IL 62703",
            house_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
            property_image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"
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
        
        // Also try to fetch additional property data from clients table if available
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('house_value, distance_meters, house_url, property_address, duration_seconds')
          .eq('lead_id', params.id)
          .single()

        // Merge lead data with client data
        leadData = {
          ...supabaseLeadData,
          ...(clientData && {
            house_value: clientData.house_value,
            distance_meters: clientData.distance_meters,
            house_url: clientData.house_url,
            property_address: clientData.property_address,
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

  const nextHouse = () => {
    setCurrentHouseIndex((prev) => (prev + 1) % houses.length)
    setCurrentPhotoIndex(0)
  }

  const prevHouse = () => {
    setCurrentHouseIndex((prev) => (prev - 1 + houses.length) % houses.length)
    setCurrentPhotoIndex(0)
  }

  const nextPhoto = () => {
    const currentHouse = houses[currentHouseIndex]
    if (currentHouse) {
      setCurrentPhotoIndex((prev) => (prev + 1) % currentHouse.photos.length)
    }
  }

  const prevPhoto = () => {
    const currentHouse = houses[currentHouseIndex]
    if (currentHouse) {
      setCurrentPhotoIndex((prev) => (prev - 1 + currentHouse.photos.length) % currentHouse.photos.length)
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

  const timeSinceLead = calculateTimeSince(lead.created_at)
  const leadName = formatName(lead)
  const { urgency } = formatUrgency(lead)
  const service = formatService(lead)
  const address = formatAddress(lead)
  const googleMapsUrl = generateGoogleMapsUrl(address)
  const currentHouse = houses[currentHouseIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col gap-10">
          {/* Top Row: Lead Info + Property Image */}
          <div className="grid grid-cols-2 gap-8">
            {/* Top Left: Lead Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Personal/Contact Information - Unified Component */}
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-xl font-bold">
                        {leadName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </span>
                    </div>
                    
                    {/* Contact Details */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{leadName}</h2>
                      <div className="space-y-1 text-gray-600">
                        <p className="text-sm">{lead.email || lead.customer_email || 'No email provided'}</p>
                        <p className="text-sm">{lead.phone || lead.phone_number || 'No phone provided'}</p>
                        <p className="text-sm">{address || 'No address provided'}</p>
                        {address && (
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm transition-colors mt-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View on Maps
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Lead Details - Structured Format */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Service Needed</p>
                      <p className="text-sm font-semibold text-gray-900">{service}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Urgency</p>
                      <p className="text-sm font-semibold text-gray-900">{urgency}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Time Since Lead</p>
                      <p className="text-sm font-semibold text-gray-900">{timeSinceLead}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Property Value</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.house_value || lead.property_value || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Distance</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.distance || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Appointment</p>
                      <p className="text-sm font-semibold text-gray-900">{formatAppointmentDate(lead) || 'Not scheduled'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Right: Single Property Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Property Image */}
              <div className="relative h-48 bg-white">
                {houses.length > 0 && houses[0].photos.length > 0 ? (
                  <img
                    src={houses[0].photos[0]}
                    alt="Property"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/noIMAGE.png';
                    }}
                  />
                ) : (
                  <img
                    src="/images/noIMAGE.png"
                    alt="No Property Image"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              {/* Property Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {houses.length > 0 ? houses[0].address : 'Property Address'}
                  </h3>
                  <p className="text-gray-600 text-sm">Residential Property</p>
                </div>
                
                {/* Property Details */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Property Value</p>
                      <p className="text-lg font-bold text-gray-900">{lead.house_value || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Distance</p>
                      <p className="text-lg font-bold text-green-600">{formatDistance(lead.distance_meters) || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Property Address</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.property_address || address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDuration(lead.duration_seconds) || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Communications + Chat Unified Component */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Communications Table Section */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Communications</h3>
            </div>
            <div className="overflow-auto" style={{ maxHeight: '300px' }}>
              <CommunicationsTable 
                communications={communications} 
                loading={communicationsLoading} 
              />
            </div>
            
            {/* Message Input Section */}
            <div className="border-t border-gray-200 px-6 py-4">
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}