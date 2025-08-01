'use client'

import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const handleWhatsAppRedirect = () => {
    const whatsappMessage = message || "Hi! I'd like to know more about your services."
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, '_blank')
    setMessage('')
    setIsOpen(false)
  }

  const quickMessages = [
    "I need visiting cards",
    "Tell me about wedding invitations",
    "What marketing materials do you offer?",
    "I want custom packaging",
    "Show me your portfolio"
  ]

  const handleQuickMessage = (msg: string) => {
    setMessage(msg)
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 animate-slide-up">
          {/* Header */}
          <div className="bg-primary-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">Taitil Graphics</h3>
                <p className="text-xs opacity-90">We're here to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Welcome Message */}
            <div className="mb-4">
              <div className="bg-secondary-50 p-3 rounded-lg mb-3">
                <p className="text-sm text-gray-700">
                  👋 Hi there! Welcome to Taitil Graphics. How can we help you today?
                </p>
              </div>
            </div>

            {/* Quick Messages */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="space-y-2">
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickMessage(msg)}
                    className="block w-full text-left text-sm p-2 bg-gray-50 hover:bg-secondary-50 rounded border border-gray-200 hover:border-primary-200 transition-colors"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
              />
              
              <button
                onClick={handleWhatsAppRedirect}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </button>
            </div>

            {/* Contact Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <p>📞 7666247666</p>
                <p>📧 taitilgraphics@gmail.com</p>
                <p>📱 WhatsApp: 7666247666</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:scale-110" />
        ) : (
          <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
        )}
      </button>
    </>
  )
}
