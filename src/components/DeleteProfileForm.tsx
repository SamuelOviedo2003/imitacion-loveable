"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

export default function DeleteProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { user, signOut } = useAuth()

  const handleDeleteProfile = async () => {
    if (!user || confirmText !== "DELETE") return

    setIsLoading(true)
    try {
      // Delete user data from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        console.error("Error deleting profile data:", profileError)
        throw new Error(`Failed to delete profile: ${profileError.message}`)
      }

      // Sign out the user after successful deletion
      await signOut()
      
      // Show success message
      alert("Profile deleted successfully. Your account has been disabled and you will be redirected to the login page.")
    } catch (error) {
      console.error("Error deleting profile:", error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to delete profile: ${errorMessage}. Please try again or contact support.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-red-600">Delete Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">⚠️ Warning</h3>
          <p className="text-red-700 text-sm">
            This action cannot be undone. Deleting your profile will permanently remove:
          </p>
          <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
            <li>Your account and all personal data</li>
            <li>Access to all businesses and leads</li>
            <li>All communication history</li>
            <li>All saved preferences and settings</li>
          </ul>
        </div>

        {!showConfirmation ? (
          <button
            onClick={() => setShowConfirmation(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Delete My Profile
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Type DELETE here"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false)
                  setConfirmText("")
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={confirmText !== "DELETE" || isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isLoading ? "Deleting..." : "Permanently Delete Profile"}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}