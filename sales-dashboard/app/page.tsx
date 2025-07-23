"use client"

import { useState } from "react"
import { Search, Settings, Users, DollarSign, Phone, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, Bar, Line, XAxis, YAxis, ComposedChart, ResponsiveContainer } from "recharts"

const leadsData = [
  { name: "Booked", value: 1, color: "#60A5FA" },
  { name: "Not Booked", value: 4, color: "#E5E7EB" },
]

const revenueData = [
  { month: "Jan", closedSales: 12, revenue: 45000 },
  { month: "Feb", closedSales: 8, revenue: 32000 },
  { month: "Mar", closedSales: 15, revenue: 58000 },
  { month: "Apr", closedSales: 10, revenue: 38000 },
  { month: "May", closedSales: 18, revenue: 72000 },
  { month: "Jun", closedSales: 14, revenue: 56000 },
]

const leadsTableData = [
  {
    name: "John Doe",
    urgency: "ASAP",
    service: "Full Replacement",
    houseValue: "$450,000",
    distance: "5.2 mi",
    dateTime: "Jan 1, 5:00 AM",
    speedToLead: "2:00",
    va: "Amelia",
    urgencyColor: "bg-red-50 text-red-600 border border-red-200",
    speedColor: "text-green-600",
  },
  {
    name: "Jane Smith",
    urgency: "Within 2 weeks",
    service: "Repair",
    houseValue: "$320,000",
    distance: "8.7 mi",
    dateTime: "Jan 2, 6:00 AM",
    speedToLead: "7:30",
    va: "Omar",
    urgencyColor: "bg-yellow-50 text-yellow-600 border border-yellow-200",
    speedColor: "text-orange-500",
  },
  {
    name: "David Lee",
    urgency: "Next month",
    service: "Inspection",
    houseValue: "$275,000",
    distance: "12.1 mi",
    dateTime: "Jan 3, 7:00 AM",
    speedToLead: "1:25",
    va: "Alba",
    urgencyColor: "bg-blue-50 text-blue-600 border border-blue-200",
    speedColor: "text-green-600",
  },
  {
    name: "Sarah Wilson",
    urgency: "ASAP",
    service: "Full Replacement",
    houseValue: "$680,000",
    distance: "3.1 mi",
    dateTime: "Jan 4, 8:30 AM",
    speedToLead: "0:45",
    va: "Marcus",
    urgencyColor: "bg-red-50 text-red-600 border border-red-200",
    speedColor: "text-green-600",
  },
  {
    name: "Mike Johnson",
    urgency: "Within 1 week",
    service: "Maintenance",
    houseValue: "$390,000",
    distance: "15.3 mi",
    dateTime: "Jan 5, 10:15 AM",
    speedToLead: "12:20",
    va: "Sofia",
    urgencyColor: "bg-orange-50 text-orange-600 border border-orange-200",
    speedColor: "text-red-500",
  },
]

export default function SalesDashboard() {
  const [activeSection, setActiveSection] = useState("leads")

  const menuItems = [
    { id: "leads", icon: Users, label: "New Leads" },
    { id: "setters", icon: Phone, label: "Appointment Setters" },
    { id: "revenue", icon: DollarSign, label: "Revenue" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ backgroundColor: "#E8F4F8" }}>
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="w-20 bg-gray-900 p-4 flex flex-col items-center justify-center min-h-screen rounded-r-3xl">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-8">
            <DollarSign className="w-6 h-6 text-yellow-600" />
          </div>

          <nav className="flex flex-col space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-white text-gray-900"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </nav>

          <div className="flex-1"></div>

          <button className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
              <p className="text-gray-600 mt-1">Sales Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for leads data"
                  className="pl-10 bg-white border-gray-200 focus:border-blue-400 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <Avatar>
                <AvatarFallback className="bg-blue-100 text-blue-600">ST</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content based on active section */}
          {activeSection === "leads" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* New Leads Donut Chart */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      New Leads Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-64 h-64 mx-auto">
                      <ChartContainer
                        config={{
                          booked: { label: "Booked", color: "#60A5FA" },
                          notBooked: { label: "Not Booked", color: "#E5E7EB" },
                        }}
                        className="w-full h-full"
                      >
                        <PieChart>
                          <Pie data={leadsData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                            {leadsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-gray-900">20%</div>
                        <div className="text-sm text-gray-600">Booked Rate</div>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="text-gray-600">Total Leads</span>
                        <span className="font-bold text-gray-900 text-xl">5</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <span className="text-gray-600">Booked</span>
                        <span className="font-bold text-green-600 text-xl">1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Cards Style Stats */}
                <div className="space-y-4">
                  <Card className="bg-purple-100 border border-purple-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Full Replacement</p>
                          <p className="text-gray-600 text-xs">$ 15,240.00</p>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">FR</span>
                          </div>
                          <span className="text-green-600 text-sm">+ 12.4%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-100 border border-green-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Repair Service</p>
                          <p className="text-gray-600 text-xs">$ 8,950.00</p>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">RS</span>
                          </div>
                          <span className="text-green-600 text-sm">+ 8.7%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-100 border border-yellow-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-600 text-sm font-medium">Inspection</p>
                          <p className="text-gray-600 text-xs">$ 3,420.00</p>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">IN</span>
                          </div>
                          <span className="text-yellow-600 text-sm">+ 5.2%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Complete Leads Table */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 flex items-center gap-2">Recent Leads</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-gray-600 bg-transparent">
                        24h
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-600 bg-transparent">
                        Top gainers
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-4 px-6 text-gray-600 font-medium">Name</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-medium">How Soon?</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-medium">Service</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-medium">House Value</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-medium">Distance</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-medium">Date & Time</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-medium">Speed-to-Lead</th>
                          <th className="text-left py-4 px-6 text-gray-600 font-medium">VA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadsTableData.map((lead, index) => (
                          <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 text-xs font-bold">
                                    {lead.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{lead.name}</p>
                                  <p className="text-xs text-gray-500 uppercase">{lead.service.substring(0, 4)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={`${lead.urgencyColor} text-xs`}>{lead.urgency}</Badge>
                            </td>
                            <td className="py-4 px-6 text-gray-600">{lead.service}</td>
                            <td className="py-4 px-6 font-medium text-gray-900">{lead.houseValue}</td>
                            <td className="py-4 px-6 text-gray-600">{lead.distance}</td>
                            <td className="py-4 px-6 text-gray-600">{lead.dateTime}</td>
                            <td className={`py-4 px-6 font-bold ${lead.speedColor}`}>{lead.speedToLead}</td>
                            <td className="py-4 px-6">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                  {lead.va.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "setters" && (
            <Card className="bg-white border border-gray-200 shadow-sm max-w-2xl">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-600" />
                  Appointment Setters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-bold">OM</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Omar Madera</h3>
                    <p className="text-gray-600">Avg. response 3.62m</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="w-4 h-4" />
                        leads 1
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        time on phone 1m
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <Phone className="w-4 h-4" />1
                      </div>
                      <div className="flex items-center gap-1 text-red-500 font-bold">
                        <span>✕</span>0
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "revenue" && (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900 text-2xl">$17,643.41</CardTitle>
                    <p className="text-gray-600 text-sm">Portfolio balance</p>
                  </div>
                  <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm">$27,483.00</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-blue-50 rounded-lg p-4">
                  <ChartContainer
                    config={{
                      closedSales: { label: "Closed Sales", color: "#60A5FA" },
                      revenue: { label: "Revenue", color: "#10B981" },
                    }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={revenueData}>
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis yAxisId="left" stroke="#9CA3AF" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar yAxisId="left" dataKey="closedSales" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#60A5FA"
                          strokeWidth={2}
                          dot={{ fill: "#60A5FA", strokeWidth: 2, r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-900 font-semibold">Market is down 0.80%</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
