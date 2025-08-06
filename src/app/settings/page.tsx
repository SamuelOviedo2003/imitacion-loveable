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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30">
      <Header />
      
      <div className="container mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Account Settings</h1>
          <p className="text-lg text-gray-600">Manage your profile information and account preferences</p>
        </div>

        <div className="grid grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Left Sidebar Menu */}
          <div className="col-span-12 md:col-span-4">
            <div className="modern-card pastel-card-sage">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Settings Menu</h3>
                <p className="text-gray-600 text-sm">Choose a category to configure</p>
              </div>
              
              <nav className="space-y-6">
                {menuSections.map((section) => (
                  <div key={section.title}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      {section.title}
                    </h4>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveMenuItem(item.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                            activeMenuItem === item.id
                              ? "bg-white shadow-md text-green-700 border-2 border-green-200"
                              : "text-gray-700 hover:bg-white/60 hover:shadow-sm"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activeMenuItem === item.id ? "bg-green-100" : "bg-gray-100"
                          }`}>
                            <span className="text-lg">{item.icon}</span>
                          </div>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-8">
            <div className="modern-card">
              {/* Content Header */}
              <div className="mb-8">
                {activeMenuItem === "edit-profile" && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile Information</h2>
                    <p className="text-gray-600">Update your personal details and contact information</p>
                  </>
                )}
                {activeMenuItem === "delete-profile" && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Profile</h2>
                    <p className="text-gray-600">Permanently remove your account and all associated data</p>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100/50 p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}