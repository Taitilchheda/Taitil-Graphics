'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Reply } from 'lucide-react'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ id: string; from: 'bot' | 'user'; text: string }[]>([])
  const { categories } = useCatalog()
  const { logEvent } = useAnalytics()

  const handleWhatsAppRedirect = () => {
    const whatsappMessage = message || "Hi! I'd like to know more about your services."
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, '_blank')
    setMessage('')
    setIsOpen(false)
    logEvent({ type: 'inquiry', label: 'chatbot-whatsapp' })
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
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, from: 'user', text: msg }])
    respond(msg)
  }

  const respond = (input: string) => {
    const flows: Record<string, string> = {
      'visiting cards': 'We offer standard, rounded, matte, glossy, QR and premium business cards. I can share design templates or start a custom layout. Would you like matte or glossy?',
      'wedding invitations': 'We design and print invitations with foil, embossing, and custom envelopes. Share your date and theme, and we’ll mock a concept.',
      'marketing materials': 'Popular picks: flyers, brochures, vinyl banners, danglers, and standees. What quantity and size do you need?',
      'packaging': 'We produce rigid boxes, product boxes, shopping bags, stickers, and sleeves. Tell me your product size and finish (matte/glossy/foil).',
      'portfolio': 'You can explore our projects section for case studies and print samples. Want me to link you there?',
    }

    const lower = input.toLowerCase()
    let reply =
      Object.entries(flows).find(([key]) => lower.includes(key))?.[1] ||
      'Got it! Tell me the product, quantity, and any finish you prefer and I’ll get a quote started.'

    // Add a dynamic recommended category suggestion
    const featuredCategory = categories[0]
    if (featuredCategory) {
      reply += ` Also, our ${featuredCategory.name} category is trending—want to view it-`
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { id: `bot-${Date.now()}`, from: 'bot', text: reply }])
    }, 400)
  }

  const handleSend = () => {
    if (!message.trim()) return
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, from: 'user', text: message }])
    respond(message)
    setMessage('')
    logEvent({ type: 'click', label: 'chatbot-send' })
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', from: 'bot', text: '👋 Hi! I’m your print assistant. Ask me about visiting cards, cake toppers, packaging, or any custom job.' }])
    }
  }, [isOpen, messages.length])

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
                <p className="text-xs opacity-90">We&apos;re here to help!</p>
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
          <div className="p-4 max-h-96 overflow-y-auto space-y-3">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${item.from === 'bot' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    item.from === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-primary-500 text-white'
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}

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
            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={handleSend}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleWhatsAppRedirect}
                  className="flex-1 bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
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
