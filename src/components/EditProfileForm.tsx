"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

interface ProfileData {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  ghl_id: string | null
  telegram_id: string | null
}

export default function EditProfileForm() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: ''
  })

  
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch current profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          setMessage({ type: 'error', text: 'Failed to load profile data' })
          return
        }

        if (data) {
          setProfile(data)
          setFormData({
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || ''
          })
          if (data.avatar_url) {
            setPreviewUrl(data.avatar_url)
          }
        }
      } catch (error) {
        console.error('Error:', error)
        setMessage({ type: 'error', text: 'Failed to load profile data' })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear any existing messages when user starts typing
    if (message) setMessage(null)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For demo purposes, we'll just show a preview
      // In a real implementation, you'd upload to a service like Supabase Storage
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
        // For demo, we'll set a placeholder URL
        setFormData(prev => ({
          ...prev,
          avatar_url: 'https://placeholder-image-url.com/demo-avatar.jpg'
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setFormData(prev => ({
      ...prev,
      avatar_url: ''
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
        return
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          full_name: formData.full_name || null,
          avatar_url: formData.avatar_url || null
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Edit Profile Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Edit Profile Info</CardTitle>
        <p className="text-sm text-gray-600">Update your personal information and preferences.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email address cannot be changed</p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Profile Picture
            </Label>
            <div className="flex items-center space-x-4">
              {/* Preview */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 text-xs text-center">
                    No Image
                  </div>
                )}
              </div>
              
              {/* Upload/Remove buttons */}
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </Button>
                  {(previewUrl || selectedImage) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB) - Demo only</p>
              </div>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Telegram ID (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="telegram_id" className="text-sm font-medium text-gray-700">
              Telegram ID
            </Label>
            <Input
              id="telegram_id"
              type="text"
              value={profile?.telegram_id || 'Not set'}
              disabled
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Telegram ID is managed by the system</p>
          </div>

          {/* GHL ID (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="ghl_id" className="text-sm font-medium text-gray-700">
              GHL ID
            </Label>
            <Input
              id="ghl_id"
              type="text"
              value={profile?.ghl_id || 'Not set'}
              disabled
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">GoHighLevel ID is managed by the system</p>
          </div>



          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}