'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Users, Clock, Send, Bot, User } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  message: string
  senderType: 'user' | 'admin'
  createdAt: Date
  isRead?: boolean
}

interface Conversation {
  id: string
  userId: string
  status: 'open' | 'closed' | 'pending'
  subject?: string
  priority: 'low' | 'medium' | 'high'
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
  messages?: ChatMessage[]
  unreadCount?: number
}

export default function AdminChatDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [isConnected] = useState(true)

  // Simplified for demo without Socket.IO

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login')
      return
    }
    loadConversations()
  }, [authLoading, user, router])

  if (!user || user.role !== 'admin') {
    return null
  }

  const loadConversations = async () => {
    setLoadingConversations(true)
    try {
      // In a real app, this would be an API call
      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          userId: 'user-1',
          status: 'open',
          subject: 'General Support',
          priority: 'medium',
          lastMessageAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          unreadCount: 2
        },
        {
          id: 'conv-2',
          userId: 'user-2',
          status: 'open',
          subject: 'Pricing Inquiry',
          priority: 'high',
          lastMessageAt: new Date(Date.now() - 300000),
          createdAt: new Date(),
          updatedAt: new Date(),
          unreadCount: 1
        }
      ]
      setConversations(mockConversations)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoadingConversations(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      // In a real app, this would be an API call
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          conversationId,
          senderId: 'user-1',
          senderType: 'user',
          message: 'Hello, I need help with your services',
          isRead: true,
          createdAt: new Date(Date.now() - 600000),
        },
        {
          id: 'msg-2',
          conversationId,
          senderId: 'ai-assistant',
          senderType: 'admin',
          message: 'Hello! I\'d be happy to help you with information about our services. What specific service are you interested in?',
          isRead: true,
          createdAt: new Date(Date.now() - 300000),
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
    
    // Mark as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ))
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    const messageText = newMessage
    setNewMessage('')

    const optimisticMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversationId: selectedConversation.id,
      senderId: 'admin-user',
      senderType: 'admin',
      message: messageText,
      isRead: false,
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, optimisticMessage])
  }

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            Chat Dashboard
          </h1>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {conversations.length} conversations
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {conversation.subject || `User ${conversation.userId}`}
                      </h3>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(conversation.priority)}`}>
                        {conversation.priority}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="font-semibold text-gray-900">
                {selectedConversation.subject || `Conversation with User ${selectedConversation.userId}`}
              </h2>
              <p className="text-sm text-gray-600">
                Status: {selectedConversation.status} • Priority: {selectedConversation.priority}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.senderType === 'admin'
                          ? 'bg-blue-600 text-white'
                          : message.senderId === 'ai-assistant'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        {message.senderType === 'user' ? (
                          <User className="w-3 h-3" />
                        ) : message.senderId === 'ai-assistant' ? (
                          <Bot className="w-3 h-3" />
                        ) : (
                          <MessageCircle className="w-3 h-3" />
                        )}
                        <span className="text-xs font-medium">
                          {message.senderType === 'user' 
                            ? 'Customer' 
                            : message.senderId === 'ai-assistant' 
                            ? 'AI Assistant' 
                            : 'You'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
