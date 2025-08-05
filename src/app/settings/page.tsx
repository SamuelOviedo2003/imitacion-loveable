"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/Header"
import EditProfileForm from "@/components/EditProfileForm"
import DeleteProfileForm from "@/components/DeleteProfileForm"

export default function SettingsPage() {
  const [activeMenuItem, setActiveMenuItem] = useState("edit-profile")

  const menuSections = [
    {
      title: "Settings",
      items: [
        {
          id: "edit-profile",
          label: "Edit Profile Info",
          icon: "👤"
        }
      ]
    },
    {
      title: "General",
      items: [
        {
          id: "delete-profile",
          label: "Delete Profile",
          icon: "🗑️"
        }
      ]
    }
  ]

  const renderContent = () => {
    switch (activeMenuItem) {
      case "edit-profile":
        return <EditProfileForm />
      case "delete-profile":
        return <DeleteProfileForm />
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
              <CardContent className="p-0">
                <nav className="space-y-6 py-4">
                  {menuSections.map((section) => (
                    <div key={section.title}>
                      <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item) => (
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
                      </div>
                    </div>
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