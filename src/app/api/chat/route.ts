import { NextRequest, NextResponse } from 'next/server'

// Mock chat messages database
let chatMessages: Array<{
  id: string
  userId: string
  message: string
  sender: 'user' | 'support'
  timestamp: Date
  read: boolean
}> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get messages for the specific user
    const userMessages = chatMessages.filter(msg => msg.userId === userId)

    return NextResponse.json({
      messages: userMessages
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, message, sender = 'user' } = await request.json()

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'User ID and message are required' },
        { status: 400 }
      )
    }

    const newMessage = {
      id: Date.now().toString(),
      userId,
      message,
      sender,
      timestamp: new Date(),
      read: false
    }

    chatMessages.push(newMessage)

    // Auto-reply for demo purposes
    if (sender === 'user') {
      setTimeout(() => {
        const autoReply = {
          id: (Date.now() + 1).toString(),
          userId,
          message: generateAIResponse(message),
          sender: 'support' as const,
          timestamp: new Date(),
          read: false
        }
        chatMessages.push(autoReply)
      }, 2000)
    }

    return NextResponse.json({
      message: newMessage,
      success: true
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const { userId, messageIds } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Mark messages as read
    chatMessages = chatMessages.map(msg => {
      if (msg.userId === userId && (!messageIds || messageIds.includes(msg.id))) {
        return { ...msg, read: true }
      }
      return msg
    })

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// AI Response Generator
function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  if (message.includes('price') || message.includes('cost') || message.includes('quote')) {
    return "I'd be happy to help you with pricing information! Our services are competitively priced and we offer custom quotes based on your specific needs. Would you like me to connect you with our sales team for a detailed quote?"
  }

  if (message.includes('service') || message.includes('what do you do')) {
    return "We offer a wide range of professional services including graphic design, web development, digital marketing, and business consulting. What specific service are you interested in learning more about?"
  }

  if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
    return "You can reach us through multiple channels:\n📞 Phone: +1 (555) 123-4567\n📧 Email: info@taitilgraphics.com\n💬 WhatsApp: Available 24/7\n🕒 Business Hours: Mon-Fri 9AM-6PM"
  }

  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! Welcome to Taitil Graphics. I'm here to help you with any questions about our services. How can I assist you today?"
  }

  if (message.includes('help') || message.includes('support')) {
    return "I'm here to help! You can ask me about:\n• Our services and pricing\n• How to get started with a project\n• Contact information\n• General questions about our company\n\nWhat would you like to know?"
  }

  // Default response
  return "Thank you for your message! I understand you're asking about: \"" + userMessage + "\". Let me connect you with one of our specialists who can provide you with detailed information. In the meantime, feel free to browse our services or contact us directly for immediate assistance."
}
