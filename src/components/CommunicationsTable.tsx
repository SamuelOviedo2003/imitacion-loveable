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
  
  // Sort communications by created date (oldest to newest)
  const sortedCommunications = [...communications].sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

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
    <table className="w-full">
      <thead className="bg-gray-50 sticky top-0">
        <tr>
          <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm w-48">Type</th>
          <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Summary</th>
          <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm w-32">Created</th>
          <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm w-20">Audio</th>
        </tr>
      </thead>
      <tbody>
        {sortedCommunications.map((communication) => {
          const isCurrentlyPlaying = audioState.playing && audioState.currentId === communication.communication_id
          const hasRecording = !!communication.recording_url
          
          return (
            <tr key={communication.communication_id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-6 w-48">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getMessageTypeColor(communication.message_type)}`}>
                  {formatMessageType(communication.message_type)}
                </span>
              </td>
              <td className="py-4 px-6 text-gray-900">
                <div className="text-sm leading-relaxed" title={communication.summary || ''}>
                  {communication.summary || 'No summary available'}
                </div>
              </td>
              <td className="py-4 px-6 text-gray-600 text-sm w-32">
                {new Date(communication.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </td>
              <td className="py-4 px-6 w-20">
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
  )
}