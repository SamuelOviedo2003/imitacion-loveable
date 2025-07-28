"use client"

import { useState, useRef } from "react"
import { Play, Pause } from "lucide-react"
import { Communication } from "@/hooks/useCommunications"

interface CommunicationsTableProps {
  communications: Communication[]
  loading: boolean
}

interface AudioState {
  playing: boolean
  currentId: number | null
}

const formatMessageType = (messageType: string) => {
  // Convert snake_case or kebab-case to Title Case
  return messageType
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getMessageTypeColor = (messageType: string) => {
  const lowerType = messageType.toLowerCase()
  
  if (lowerType.includes('email')) {
    return 'bg-blue-50 text-blue-600 border border-blue-200'
  }
  if (lowerType.includes('sms') || lowerType.includes('text')) {
    return 'bg-green-50 text-green-600 border border-green-200'
  }
  if (lowerType.includes('call') || lowerType.includes('phone')) {
    return 'bg-purple-50 text-purple-600 border border-purple-200'
  }
  if (lowerType.includes('voicemail')) {
    return 'bg-orange-50 text-orange-600 border border-orange-200'
  }
  
  // Default color
  return 'bg-gray-50 text-gray-600 border border-gray-200'
}

export default function CommunicationsTable({ communications, loading }: CommunicationsTableProps) {
  const [audioState, setAudioState] = useState<AudioState>({ playing: false, currentId: null })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlayPause = (communication: Communication) => {
    if (!communication.recording_url) return

    const isCurrentlyPlaying = audioState.playing && audioState.currentId === communication.communication_id

    if (isCurrentlyPlaying) {
      // Pause current audio
      audioRef.current?.pause()
      setAudioState({ playing: false, currentId: null })
    } else {
      // Stop any currently playing audio
      audioRef.current?.pause()
      
      // Create new audio element
      const audio = new Audio(communication.recording_url)
      audioRef.current = audio
      
      audio.onended = () => {
        setAudioState({ playing: false, currentId: null })
      }
      
      audio.onerror = () => {
        setAudioState({ playing: false, currentId: null })
        console.error('Error playing audio')
      }
      
      // Play new audio
      audio.play().then(() => {
        setAudioState({ playing: true, currentId: communication.communication_id })
      }).catch((error) => {
        console.error('Error playing audio:', error)
        setAudioState({ playing: false, currentId: null })
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">Loading communications...</div>
    )
  }

  if (communications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No communications recorded for this lead.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Summary</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Recording</th>
          </tr>
        </thead>
        <tbody>
          {communications.map((communication) => {
            const isCurrentlyPlaying = audioState.playing && audioState.currentId === communication.communication_id
            const hasRecording = !!communication.recording_url
            
            return (
              <tr key={communication.communication_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(communication.message_type)}`}>
                    {formatMessageType(communication.message_type)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-900 max-w-xs">
                  <div className="truncate" title={communication.summary || ''}>
                    {communication.summary || 'No summary available'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handlePlayPause(communication)}
                    disabled={!hasRecording}
                    className={`p-2 rounded-full transition-colors ${
                      hasRecording 
                        ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    title={hasRecording ? (isCurrentlyPlaying ? 'Pause recording' : 'Play recording') : 'No recording available'}
                  >
                    {isCurrentlyPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}