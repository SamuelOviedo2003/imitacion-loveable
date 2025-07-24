export const formatName = (lead: any) => {
  if (lead.customer_name) return lead.customer_name
  if (lead.first_name && lead.last_name) return `${lead.first_name} ${lead.last_name}`
  return lead.name || 'Unknown'
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