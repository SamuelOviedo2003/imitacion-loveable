"use client"

import { useState } from "react"
import { Send } from "lucide-react"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isOwnMessage: boolean
  type: 'text' | 'poll' | 'voice'
}

interface SystemEvent {
  id: number
  type: 'system'
  event: string
  timestamp: string
}

type ChatItem = Message | SystemEvent

const mockChatItems: ChatItem[] = [
  {
    id: 1,
    sender: "John Doe",
    content: "Hi there! I'm interested in getting a quote for roof repair.",
    timestamp: "Today 2:30 PM",
    isOwnMessage: false,
    type: 'text'
  },
  {
    id: 2,
    type: 'system',
    event: 'Outgoing Call',
    timestamp: "Today 2:31 PM"
  },
  {
    id: 3,
    sender: "You",
    content: "Hi John! I'd be happy to help you with that. Can you tell me more about the issues you're experiencing?",
    timestamp: "Today 2:32 PM",
    isOwnMessage: true,
    type: 'text'
  },
  {
    id: 4,
    sender: "John Doe", 
    content: "I have some missing shingles and noticed a small leak during the last storm.",
    timestamp: "Today 2:35 PM",
    isOwnMessage: false,
    type: 'text'
  },
  {
    id: 5,
    type: 'system',
    event: 'Follow-up Email Sent',
    timestamp: "Today 2:36 PM"
  },
  {
    id: 6,
    sender: "You",
    content: "That definitely needs attention. I can schedule an inspection for you. What days work best?",
    timestamp: "Today 2:37 PM",
    isOwnMessage: true,
    type: 'text'
  }
]

export default function ChatInterface() {
  const [message, setMessage] = useState("")

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message logic here
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-80">
      {/* Date Separator */}
      <div className="text-center mb-4">
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Today</span>
      </div>
      
      {/* Messages Container - Reduced Height */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4" style={{ maxHeight: '240px' }}>
        {mockChatItems.map((item, index) => {
          if (item.type === 'system') {
            return (
              <div key={item.id} className="flex items-center justify-center my-3">
                <div className="flex items-center w-full">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-xs text-gray-500 bg-gray-50 rounded-full">
                    {item.event}
                  </span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              </div>
            )
          }

          const message = item as Message
          const showTimestamp = index === 0 || 
            (mockChatItems[index - 1].type !== 'system' && 
             (mockChatItems[index - 1] as Message).isOwnMessage !== message.isOwnMessage) ||
            index % 4 === 0;
            
          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="text-center mb-2">
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
              )}
              <div
                className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    message.isOwnMessage
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-2 rounded-full transition-colors ${
              message.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}