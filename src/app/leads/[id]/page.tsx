"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from '@/lib/supabase'
import CommunicationsTable from "@/components/CommunicationsTable"
import ChatInterface from "@/components/ChatInterface"
import { useCommunications } from "@/hooks/useCommunications"
import { 
  calculateTimeSince, 
  formatName, 
  formatUrgency, 
  formatService, 
  formatAddress, 
  generateGoogleMapsUrl,
  formatDuration 
} from "@/lib/leadUtils"

interface CallAttempt {
  id: string
  assigned: string
  call_number: number
  duration: number
  created_at: string
}

interface House {
  id: string
  address: string
  photos: string[]
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [lead, setLead] = useState<any>(null)
  const [callAttempts, setCallAttempts] = useState<CallAttempt[]>([])
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
            distance: "5.2 mi",
            created_at: "2024-01-01T05:00:00Z",
            email: "john.doe@example.com",
            phone: "(555) 123-4567",
            street_address: "123 Main St",
            city: "Springfield",
            state: "IL",
            zip_code: "62701"
          },
          {
            lead_id: "mock-lead-2",
            first_name: "Jane",
            last_name: "Smith",
            urgency: "Within 2 weeks",
            service: "Repair",
            house_value: "$320,000",
            distance: "8.7 mi",
            created_at: "2024-01-02T06:00:00Z",
            email: "jane.smith@example.com",
            phone: "(555) 234-5678",
            street_address: "456 Oak Ave",
            city: "Springfield",
            state: "IL",
            zip_code: "62702"
          },
          {
            lead_id: "mock-lead-3",
            first_name: "David",
            last_name: "Lee",
            urgency: "Next month",
            service: "Inspection",
            house_value: "$275,000",
            distance: "12.1 mi",
            created_at: "2024-01-03T07:00:00Z",
            email: "david.lee@example.com",
            phone: "(555) 345-6789",
            street_address: "789 Pine Rd",
            city: "Springfield",
            state: "IL",
            zip_code: "62703"
          }
        ]
        
        const mockLead = mockLeads.find(lead => lead.lead_id === params.id)
        if (mockLead) {
          setLead(mockLead)
        } else {
          throw new Error('Mock lead not found')
        }
      } else {
        // Fetch lead details from Supabase
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('lead_id', params.id)
          .single()

        if (leadError) throw leadError
        setLead(leadData)
      }

      // Fetch call attempts
      const { data: callsData, error: callsError } = await supabase
        .from('leads_calls')
        .select('*')
        .eq('lead_id', params.id)
        .order('created_at', { ascending: true })

      if (!callsError && callsData) {
        const numberedCalls = callsData.map((call, index) => ({
          ...call,
          call_number: index + 1
        }))
        setCallAttempts(numberedCalls)
      }

      // Mock houses data - replace with actual API call
      setHouses([
        {
          id: '1',
          address: '123 Main St',
          photos: [
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
          ]
        },
        {
          id: '2', 
          address: '456 Oak Ave',
          photos: [
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
          ]
        }
      ])

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-8xl mx-auto h-screen flex gap-4">
        {/* Left Section - Content Grid */}
        <div className="flex-1 grid grid-rows-2 gap-4">
          {/* Top Row: Lead Info + Property Image */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Left: Lead Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white text-lg font-bold">
                      {leadName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{leadName}</h2>
                    <p className="text-gray-600 text-sm mb-1">{service}</p>
                    <p className="text-xs text-gray-500">Time Since Lead: {timeSinceLead}</p>
                  </div>
                </div>
                
                {/* Contact & Lead Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">How Soon:</span>
                    <span className="text-gray-900 font-semibold">{urgency}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="text-gray-900 font-semibold text-xs">{lead.email || lead.customer_email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Phone:</span>
                    <span className="text-gray-900 font-semibold">{lead.phone || lead.phone_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-start py-1 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Address:</span>
                    <span className="text-gray-900 font-semibold text-right text-xs max-w-xs">{address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 font-medium">Appointment:</span>
                    <span className="text-gray-900 font-semibold text-xs">{formatAppointmentDate(lead) || 'Not scheduled'}</span>
                  </div>
                  {address && (
                    <div className="pt-1">
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold transition-colors text-xs"
                      >
                        View on Google Maps
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Center: Property Image and Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {currentHouse && currentHouse.photos.length > 0 ? (
                /* Property with Images - Carousel */
                <div className="h-full flex flex-col">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
                      {houses.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={prevHouse}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="text-sm text-gray-600">{currentHouseIndex + 1}/{houses.length}</span>
                          <button
                            onClick={nextHouse}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 relative">
                    <img
                      src={currentHouse.photos[currentPhotoIndex]}
                      alt={`Property photo ${currentPhotoIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Photo Navigation */}
                    {currentHouse.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                        
                        {/* Photo Indicators */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {currentHouse.photos.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPhotoIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentPhotoIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Value</p>
                        <p className="font-semibold text-gray-900">{lead.house_value || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Distance</p>
                        <p className="font-semibold text-gray-900">{lead.distance || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Photos</p>
                        <p className="font-semibold text-gray-900">{currentHouse.photos.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* No Images - Placeholder Banner */
                <div className="h-full flex flex-col">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Property Information</h3>
                  </div>
                  
                  <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-400 rounded"></div>
                      </div>
                      <p className="text-gray-600 font-medium">No Property Images</p>
                      <p className="text-gray-500 text-sm">Images will appear here when available</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Value</p>
                        <p className="font-semibold text-gray-900">{lead.house_value || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Distance</p>
                        <p className="font-semibold text-gray-900">{lead.distance || 'N/A'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Photos</p>
                        <p className="font-semibold text-gray-900">0</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Tables Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Call Attempts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Call Attempts</h3>
              </div>
              <div className="p-3 overflow-auto">
                {callAttempts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 font-medium text-gray-600">Agent</th>
                          <th className="text-left py-2 px-2 font-medium text-gray-600">#</th>
                          <th className="text-left py-2 px-2 font-medium text-gray-600">Duration</th>
                          <th className="text-left py-2 px-2 font-medium text-gray-600">Since</th>
                        </tr>
                      </thead>
                      <tbody>
                        {callAttempts.map((call, index) => (
                          <tr key={call.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-2 text-gray-900 text-sm">{call.assigned || 'Unknown'}</td>
                            <td className="py-2 px-2 text-gray-900 text-sm">{call.call_number}</td>
                            <td className="py-2 px-2 text-gray-900 text-sm">{formatDuration(call.duration)}</td>
                            <td className="py-2 px-2 text-gray-900 text-sm">{calculateTimeSince(call.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No call attempts recorded.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Communications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Communications</h3>
              </div>
              <div className="p-3 overflow-auto">
                <CommunicationsTable 
                  communications={communications} 
                  loading={communicationsLoading} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Full-Height Chat */}
        <div className="w-80 flex-shrink-0">
          <div className="h-full">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  )
}