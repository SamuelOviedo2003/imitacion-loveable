"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/Header"
import EditProfileForm from "@/components/EditProfileForm"

export default function SettingsPage() {
  const [activeMenuItem, setActiveMenuItem] = useState("edit-profile")

  const menuItems = [
    {
      id: "edit-profile",
      label: "Edit Profile Info",
      icon: "👤"
    }
  ]

  const renderContent = () => {
    switch (activeMenuItem) {
      case "edit-profile":
        return <EditProfileForm />
      default:
        return <EditProfileForm />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar Menu */}
          <div className="col-span-12 md:col-span-3">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenuItem(item.id)}
                      className={`w-full text-left px-6 py-3 text-sm transition-colors flex items-center gap-3 ${
                        activeMenuItem === item.id
                          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}