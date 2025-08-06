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
    [...appointmentSetters].sort((a, b) => (b.bookedLeads || 0) - (a.bookedLeads || 0)),
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
    <Card className="bg-white border border-gray-200 shadow-sm h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-600" />
            Appointment Setters
          </CardTitle>
          {showNavigation && (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs text-gray-500">
                {currentIndex + 1}/{sortedSetters.length}
              </span>
              <button
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedSetters.length > 0 && currentSetter ? (
          <>
            {/* Setter Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-bold">
                  {currentSetter.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{currentSetter.name}</h3>
                <p className="text-gray-600 text-sm">Avg. response {currentSetter.avgSpeed}</p>
              </div>
            </div>

            {/* Lead Statistics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Leads:</span>
                <span className="text-xl font-bold text-gray-900">{currentSetter.totalLeads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Contacted:</span>
                <span className="text-xl font-bold text-blue-600">{currentSetter.contactedLeads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Booked:</span>
                <span className="text-xl font-bold text-green-600">{currentSetter.bookedLeads || 0}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Contact Rate:</span>
                  <span className="text-xl font-bold text-blue-600">{currentSetter.contactRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Booking Rate:</span>
                  <span className="text-xl font-bold text-green-600">{currentSetter.bookingRate || 0}%</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600 py-8">
            <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>No appointment setter data available for the selected time period.</p>
            <p className="text-sm mt-2">Make sure leads have been assigned to setters and calls have been made.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export default AppointmentSetters