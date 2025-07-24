"use client"

import { Phone, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AppointmentSettersProps {
  appointmentSetters: any[]
}

export default function AppointmentSetters({ appointmentSetters }: AppointmentSettersProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Setters</h1>
        <p className="text-gray-600">Performance metrics for your appointment setters</p>
      </div>
      
      {appointmentSetters.length > 0 ? (
        <div className="grid gap-6">
          {appointmentSetters.map((setter, index) => (
            <Card key={index} className="bg-white border border-gray-200 shadow-sm max-w-4xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-bold">
                      {setter.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{setter.name}</h3>
                    <p className="text-gray-600">Avg. response {setter.avgSpeed}</p>
                    
                    {/* Stats Row 1 - Lead Counts */}
                    <div className="flex items-center space-x-6 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-4 h-4" />
                        leads {setter.totalLeads}
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <span>contacted {setter.contactedLeads}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <span>booked {setter.bookedLeads}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        Total Time {setter.formattedCallTime}
                      </div>
                    </div>
                    
                    {/* Stats Row 2 - Rates */}
                    <div className="flex items-center space-x-6 mt-3">
                      <div className="flex items-center gap-1 text-blue-600 font-bold">
                        <span>Contact Rate: {setter.contactRate}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <span>Booking Rate: {setter.bookingRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border border-gray-200 shadow-sm max-w-2xl">
          <CardContent className="p-6">
            <div className="text-center text-gray-600">
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No appointment setter data available for the selected time period.</p>
              <p className="text-sm mt-2">Make sure leads have been assigned to setters and calls have been made.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}