"use client"

import { useState } from "react"
import { Phone, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AppointmentSettersProps {
  appointmentSetters: any[]
}

export default function AppointmentSetters({ appointmentSetters }: AppointmentSettersProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const itemsPerPage = 2
  const showNavigation = appointmentSetters.length > itemsPerPage
  const maxIndex = Math.max(0, appointmentSetters.length - itemsPerPage)

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  const visibleSetters = appointmentSetters.slice(currentIndex, currentIndex + itemsPerPage)

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            Appointment Setters
          </CardTitle>
          {showNavigation && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-xs text-gray-500 px-2">
                {currentIndex + 1}-{Math.min(currentIndex + itemsPerPage, appointmentSetters.length)} of {appointmentSetters.length}
              </span>
              <button
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {appointmentSetters.length > 0 ? (
          <div className="space-y-3">
            {visibleSetters.map((setter, index) => (
              <div key={currentIndex + index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-bold">
                    {setter.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{setter.name}</h3>
                    <span className="text-xs text-gray-500">{setter.avgSpeed}</span>
                  </div>
                  
                  {/* Compact Stats Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-600">
                        <Phone className="w-3 h-3 inline mr-1" />
                        {setter.totalLeads}
                      </span>
                      <span className="text-blue-600">
                        contacted {setter.contactedLeads}
                      </span>
                      <span className="text-green-600">
                        booked {setter.bookedLeads}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-medium">
                      <span className="text-blue-600">{setter.contactRate}%</span>
                      <span className="text-green-600">{setter.bookingRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 py-8">
            <Phone className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm">No appointment setter data available for the selected time period.</p>
            <p className="text-xs mt-1 text-gray-500">Make sure leads have been assigned to setters and calls have been made.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}