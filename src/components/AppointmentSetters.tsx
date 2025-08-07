"use client"

import React, { useState, useMemo } from "react"
import { Phone, ChevronUp, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AppointmentSettersProps {
  appointmentSetters: any[]
}

const AppointmentSetters = React.memo(function AppointmentSetters({ appointmentSetters }: AppointmentSettersProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Memoize sorted setters to prevent unnecessary re-sorting
  const sortedSetters = useMemo(() => 
    [...(appointmentSetters || [])].sort((a, b) => (b.bookedLeads || 0) - (a.bookedLeads || 0)),
    [appointmentSetters]
  )
  
  const itemsPerPage = 1
  const showNavigation = sortedSetters.length > itemsPerPage
  const maxIndex = Math.max(0, sortedSetters.length - itemsPerPage)

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  const currentSetter = sortedSetters[currentIndex]

  return (
    <div className="space-y-4 h-full">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Phone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Appointment Setters</h3>
            <p className="text-xs text-gray-600">Performance overview</p>
          </div>
        </div>
        {showNavigation && (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronUp className="w-4 h-4 text-gray-600" />
            </button>
            <div className="px-2 py-1 bg-white rounded-full shadow-sm">
              <span className="text-xs font-medium text-gray-700">
                {currentIndex + 1}/{sortedSetters.length}
              </span>
            </div>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="p-1.5 rounded-lg bg-white shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {sortedSetters.length > 0 && currentSetter ? (
        <div className="space-y-3">
          {/* Setter Info Card - More Compact */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-purple-100">
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 text-sm font-bold">
                  {currentSetter.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900">{currentSetter.name}</h4>
                <p className="text-gray-600 text-xs">Avg. response {currentSetter.avgSpeed}</p>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  Top Performer
                </div>
              </div>
            </div>
          </div>

          {/* Statistics - More Compact */}
          <div className="space-y-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium text-sm">Total Leads</span>
                <span className="text-xl font-bold text-gray-900">{currentSetter.totalLeads || 0}</span>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium text-sm">Contacted</span>
                <span className="text-xl font-bold text-blue-600">{currentSetter.contactedLeads || 0}</span>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium text-sm">Booked</span>
                <span className="text-xl font-bold text-purple-600">{currentSetter.bookedLeads || 0}</span>
              </div>
            </div>
            
            {/* Rates Section - More Compact */}
            <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium text-sm">Contact Rate</span>
                  <span className="text-lg font-bold text-blue-600">{currentSetter.contactRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(currentSetter.contactRate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium text-sm">Booking Rate</span>
                  <span className="text-lg font-bold text-purple-600">{currentSetter.bookingRate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(currentSetter.bookingRate || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-600 py-8">
          <div className="p-3 bg-white rounded-lg shadow-sm inline-block mb-3">
            <Phone className="w-8 h-8 text-gray-400 mx-auto" />
          </div>
          <p className="font-medium mb-1 text-sm">No appointment setter data available</p>
          <p className="text-xs text-gray-500">Data will appear once setters are assigned and calls are made.</p>
        </div>
      )}
    </div>
  )
})

export default AppointmentSetters