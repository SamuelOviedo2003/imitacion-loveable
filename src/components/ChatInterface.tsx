"use client"

import { useState } from "react"
import { Send, Smile, Mic, Paperclip, MoreVertical } from "lucide-react"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isOwnMessage: boolean
  type: 'text' | 'poll' | 'voice'
}

const mockMessages: Message[] = [
  {
    id: 1,
    sender: "John Doe",
    content: "Hi there! I'm interested in getting a quote for roof repair.",
    timestamp: "2:30 PM",
    isOwnMessage: false,
    type: 'text'
  },
  {
    id: 2,
    sender: "You",
    content: "Hi John! I'd be happy to help you with that. Can you tell me more about the issues you're experiencing?",
    timestamp: "2:32 PM",
    isOwnMessage: true,
    type: 'text'
  },
  {
    id: 3,
    sender: "John Doe",
    content: "I have some missing shingles and noticed a small leak during the last storm.",
    timestamp: "2:35 PM",
    isOwnMessage: false,
    type: 'text'
  },
  {
    id: 4,
    sender: "You",
    content: "That definitely needs attention. I can schedule an inspection for you. What days work best?",
    timestamp: "2:37 PM",
    isOwnMessage: true,
    type: 'text'
  }
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        sender: "You",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwnMessage: true,
        type: 'text'
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const emojis = ['😊', '😂', '👍', '❤️', '🎉', '🤔', '👌', '🙏']

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Conference Meeting</h3>
            <p className="text-xs text-gray-500">Lead Conversation</p>
          </div>
          <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-2xl ${
                message.isOwnMessage
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="text-xs leading-relaxed">{message.content}</p>
              <p
                className={`text-xs mt-1 opacity-75 ${
                  message.isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Poll Demo Section */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
        <div className="bg-white rounded-lg p-2 border border-gray-200">
          <p className="text-xs font-medium text-gray-900 mb-2">Quick Poll: Best time for inspection?</p>
          <div className="space-y-1">
            <button className="w-full text-left px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
              Morning (8-12 PM) - 3 votes
            </button>
            <button className="w-full text-left px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors">
              Afternoon (12-5 PM) - 1 vote
            </button>
            <button className="w-full text-left px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors">
              Evening (5-8 PM) - 0 votes
            </button>
          </div>
        </div>
      </div>

      {/* Voice Note Preview */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mic className="w-3 h-3 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-orange-800">Voice message from John</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-orange-200 rounded-full h-1">
                  <div className="bg-orange-500 h-1 rounded-full w-1/3"></div>
                </div>
                <span className="text-xs text-orange-600">0:15</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-2 flex-wrap">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  setNewMessage(newMessage + emoji)
                  setShowEmojiPicker(false)
                }}
                className="w-8 h-8 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                rows={1}
                style={{ minHeight: '32px', maxHeight: '80px' }}
              />
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Smile className="w-3 h-3 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <Paperclip className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              newMessage.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Send now
          </button>
        </div>
      </div>
    </div>
  )
}