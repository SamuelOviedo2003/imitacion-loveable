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

            {/* Top Center: Property Carousel */}
            <div className="relative">
              {houses.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Property Card */}
                  <div className="relative">
                    {/* Property Image with Internal Slider */}
                    <div className="relative h-48 bg-gray-100">
                      {currentHouse && currentHouse.photos.length > 0 ? (
                        <>
                          <img
                            src={currentHouse.photos[currentPhotoIndex]}
                            alt={`Property photo ${currentPhotoIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Timer Badge (like auction countdown) */}
                          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs">
                            {currentHouse.photos.length} photos
                          </div>
                          
                          {/* Internal Photo Navigation */}
                          {currentHouse.photos.length > 1 && (
                            <>
                              <button
                                onClick={prevPhoto}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-colors shadow-sm"
                              >
                                <ChevronLeft className="w-3 h-3 text-gray-800" />
                              </button>
                              <button
                                onClick={nextPhoto}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-colors shadow-sm"
                              >
                                <ChevronRight className="w-3 h-3 text-gray-800" />
                              </button>
                              
                              {/* Photo Dots */}
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                {currentHouse.photos.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentPhotoIndex(index)}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                      index === currentPhotoIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gray-400 rounded-lg flex items-center justify-center">
                              <div className="w-6 h-6 bg-gray-500 rounded"></div>
                            </div>
                            <p className="text-gray-600 text-xs">No Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Property Info Card Body */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {currentHouse?.address || 'Property Address'}
                        </h3>
                        <p className="text-gray-600 text-sm">Residential Property</p>
                      </div>
                      
                      {/* Property Stats - Similar to auction info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                            <span>{currentHouse?.photos.length || 0} Photos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                            <span>Distance</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                            <span>Status</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Pricing Section - Like auction card */}
                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Property Value</p>
                            <p className="text-lg font-bold text-gray-900">{lead.house_value || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Distance</p>
                            <p className="text-lg font-bold text-green-600">{lead.distance || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Navigation (House Carousel) */}
                  {houses.length > 1 && (
                    <div className="absolute -left-3 top-1/2 transform -translate-y-1/2">
                      <button
                        onClick={prevHouse}
                        className="p-2 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  
                  {houses.length > 1 && (
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
                      <button
                        onClick={nextHouse}
                        className="p-2 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  
                  {houses.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-xs">
                        {currentHouseIndex + 1} / {houses.length}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-400 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-500 rounded"></div>
                      </div>
                      <p className="text-gray-600">No Properties Available</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Communications Table */}
          <div className="flex gap-4">
            {/* Communications Table - Full Width */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Communications</h3>
              </div>
              <div className="overflow-auto" style={{ maxHeight: 'calc(50vh - 60px)' }}>
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