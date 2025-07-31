export const formatName = (lead: any) => {
  const firstName = lead.first_name?.trim()
  const lastName = lead.last_name?.trim()
  
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  return 'Unknown'
}

export const formatUrgency = (lead: any) => {
  const urgency = lead.urgency || lead.priority || lead.how_soon || 'Not specified'
  let urgencyColor = "bg-gray-50 text-gray-600 border border-gray-200"
  
  if (urgency.toLowerCase().includes('asap') || urgency.toLowerCase().includes('urgent')) {
    urgencyColor = "bg-red-50 text-red-600 border border-red-200"
  } else if (urgency.toLowerCase().includes('week')) {
    urgencyColor = "bg-orange-50 text-orange-600 border border-orange-200"
  } else if (urgency.toLowerCase().includes('month')) {
    urgencyColor = "bg-blue-50 text-blue-600 border border-blue-200"
  }
  
  return { urgency, urgencyColor }
}

export const formatService = (lead: any) => {
  return lead.service_type || lead.service || 'Service'
}

export const formatDateTime = (lead: any) => {
  const date = lead.created_at || lead.date_time || lead.dateTime
  if (date) {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  return 'N/A'
}

export const formatSpeedToLead = (lead: any) => {
  const speed = lead.speed_to_lead || lead.speedToLead || '0:00'
  const speedNum = parseInt(speed.split(':')[0]) || 0
  let speedColor = "text-green-600"
  if (speedNum > 10) speedColor = "text-red-500"
  else if (speedNum > 5) speedColor = "text-orange-500"
  
  return { speed, speedColor }
}

export const formatGrade = (lead: any) => {
  return lead.grade || lead.lead_grade || 'A'
}

export const formatNextStep = (lead: any) => {
  return lead.next_step || lead.status || 'Contact'
}

export const calculateTimeSince = (timestamp: string | Date): string => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInMs = now.getTime() - past.getTime()
  
  const minutes = Math.floor(diffInMs / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  } else {
    return `${minutes}m`
  }
}

export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const formatAddress = (lead: any): string => {
  const parts = []
  if (lead.street_address) parts.push(lead.street_address)
  if (lead.city) parts.push(lead.city)
  if (lead.state) parts.push(lead.state)
  if (lead.zip_code) parts.push(lead.zip_code)
  return parts.join(', ')
}

export const generateGoogleMapsUrl = (address: string): string => {
  const encodedAddress = encodeURIComponent(address)
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
}