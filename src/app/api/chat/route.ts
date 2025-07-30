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
          message: 'Thank you for your message! Our support team will get back to you shortly. For immediate assistance, please contact us via WhatsApp.',
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
