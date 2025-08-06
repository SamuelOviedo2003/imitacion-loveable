"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Communication } from "@/hooks/useCommunications"
import { useAuth } from "@/contexts/AuthContext"
import { formatCommunicationDateTime } from "@/lib/leadUtils"

interface CommunicationsTableProps {
  communications: Communication[]
  loading: boolean
}

interface AudioState {
  playing: boolean
  currentId: number | null
  duration: number
  currentTime: number
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
  const { businessData } = useAuth()
  const [audioState, setAudioState] = useState<AudioState>({ 
    playing: false, 
    currentId: null, 
    duration: 0, 
    currentTime: 0 
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Update progress
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        setAudioState(prev => ({
          ...prev,
          currentTime: audioRef.current?.currentTime || 0,
          duration: audioRef.current?.duration || 0
        }))
      }
    }

    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('timeupdate', updateProgress)
      audio.addEventListener('loadedmetadata', updateProgress)
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress)
        audio.removeEventListener('loadedmetadata', updateProgress)
      }
    }
  }, [audioRef.current])
  
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
      setAudioState(prev => ({ ...prev, playing: false, currentId: null }))
    } else {
      // Stop any currently playing audio
      audioRef.current?.pause()
      
      // Create new audio element
      const audio = new Audio(communication.recording_url)
      audioRef.current = audio
      
      audio.onended = () => {
        setAudioState(prev => ({ ...prev, playing: false, currentId: null }))
      }
      
      audio.onerror = () => {
        setAudioState(prev => ({ ...prev, playing: false, currentId: null }))
        console.error('Error playing audio')
      }
      
      // Play new audio
      audio.play().then(() => {
        setAudioState(prev => ({ ...prev, playing: true, currentId: communication.communication_id }))
      }).catch((error) => {
        console.error('Error playing audio:', error)
        setAudioState(prev => ({ ...prev, playing: false, currentId: null }))
      })
    }
  }

  const handleSeek = (communication: Communication, seekTime: number) => {
    if (!audioRef.current || audioState.currentId !== communication.communication_id) return
    
    audioRef.current.currentTime = seekTime
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/80">
            <tr>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Type</th>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Summary</th>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Created</th>
              <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm">Audio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {sortedCommunications.map((communication) => {
              const isCurrentlyPlaying = audioState.playing && audioState.currentId === communication.communication_id
              const hasRecording = !!communication.recording_url
              
              return (
                <tr key={communication.communication_id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-medium ${getMessageTypeColor(communication.message_type)} shadow-sm`}>
                      {formatMessageType(communication.message_type)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm leading-relaxed text-gray-900" title={communication.summary || ''}>
                      {communication.summary || 'No summary available'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600 text-sm">
                      {formatCommunicationDateTime(communication.created_at, businessData?.time_zone)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {hasRecording ? (
                      <div className="flex flex-col items-center space-y-2">
                        <button
                          onClick={() => handlePlayPause(communication)}
                          className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title={isCurrentlyPlaying ? 'Pause recording' : 'Play recording'}
                        >
                          {isCurrentlyPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        
                        {/* Progress Bar */}
                        <div className="w-full max-w-[100px]">
                          <div className="relative">
                            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              {/* Progress fill */}
                              {audioState.currentId === communication.communication_id && audioState.duration > 0 && (
                                <div 
                                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-100"
                                  style={{ 
                                    width: `${(audioState.currentTime / audioState.duration) * 100}%` 
                                  }}
                                />
                              )}
                              
                              {/* Clickable overlay */}
                              <input
                                type="range"
                                min="0"
                                max={audioState.currentId === communication.communication_id ? audioState.duration || 0 : 0}
                                step="0.1"
                                value={audioState.currentId === communication.communication_id ? audioState.currentTime : 0}
                                onChange={(e) => handleSeek(communication, parseFloat(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={audioState.currentId !== communication.communication_id}
                              />
                            </div>
                          </div>
                          
                          {/* Time Display */}
                          {audioState.currentId === communication.communication_id && (
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{formatTime(audioState.currentTime)}</span>
                              <span>{formatTime(audioState.duration)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        disabled
                        className="p-2 rounded-xl bg-gray-100 text-gray-300 cursor-not-allowed shadow-sm"
                        title="No recording available"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}