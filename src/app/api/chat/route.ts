import crypto from 'crypto'
import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/server-auth'

type ChatSender = 'user' | 'support'

type ChatMessage = {
  id: string
  conversationId: string
  message: string
  sender: ChatSender
  timestamp: string
  read: boolean
}

type ChatStore = {
  messages: ChatMessage[]
}

const guestCookieName = 'tg_chat_guest_id'
// Vercel's serverless runtime has a read-only filesystem except for `/tmp`.
// Use `/tmp` for ephemeral chat persistence; fall back to an in-memory store
// when even that fails (e.g. on platforms without any writable fs).
const chatStorePath = path.join('/tmp', 'chat-messages.json')

const fallbackStore: ChatStore = { messages: [] }

const loadStore = async (): Promise<ChatStore> => {
  try {
    const raw = await readFile(chatStorePath, 'utf-8')
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.messages)) {
      return fallbackStore
    }
    return { messages: parsed.messages }
  } catch {
    return fallbackStore
  }
}

const saveStore = async (store: ChatStore) => {
  try {
    await writeFile(chatStorePath, JSON.stringify(store, null, 2), 'utf-8')
  } catch {
    // Filesystem is read-only (or `/tmp` is unavailable). The in-memory
    // fallbackStore was already used by loadStore, so we silently drop the
    // write — messages will live for the lifetime of the running instance.
  }
}

const isValidGuestId = (value: string) => /^[a-f0-9-]{16,}$/i.test(value)

const resolveConversation = async (request: NextRequest) => {
  const auth = await getAuthUser(request)
  if (auth) {
    return {
      conversationId: `user:${auth.id}`,
      setGuestCookie: null as string | null,
      isAdmin: auth.role === 'admin',
    }
  }

  const existingGuestId = request.cookies.get(guestCookieName)?.value
  if (existingGuestId && isValidGuestId(existingGuestId)) {
    return {
      conversationId: `guest:${existingGuestId}`,
      setGuestCookie: null as string | null,
      isAdmin: false,
    }
  }

  const createdGuestId = crypto.randomUUID()
  return {
    conversationId: `guest:${createdGuestId}`,
    setGuestCookie: createdGuestId,
    isAdmin: false,
  }
}

const attachGuestCookieIfNeeded = (
  response: NextResponse,
  guestId: string | null
): NextResponse => {
  if (!guestId) return response

  response.cookies.set({
    name: guestCookieName,
    value: guestId,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}

const generateSupportReply = (input: string) => {
  const lowered = input.toLowerCase()

  if (lowered.includes('price') || lowered.includes('cost') || lowered.includes('quote')) {
    return 'We can help with pricing. Please share product name, quantity, and preferred finish, and we will prepare a quote.'
  }

  if (lowered.includes('service') || lowered.includes('what do you do')) {
    return 'We provide printing, packaging, branding, and celebration products. Tell us what you need and we will guide you quickly.'
  }

  if (lowered.includes('contact') || lowered.includes('phone') || lowered.includes('email')) {
    return 'You can reach us at +91 7666 24 7666 or taitilgraphics@gmail.com. We are available daily from 10:00 AM to 7:00 PM.'
  }

  return 'Thanks for your message. Share your requirement and quantity, and our team will help you with the next steps.'
}

export async function GET(request: NextRequest) {
  try {
    const { conversationId, setGuestCookie } = await resolveConversation(request)
    const store = await loadStore()
    const messages = store.messages.filter((msg) => msg.conversationId === conversationId)

    const response = NextResponse.json({ messages })
    return attachGuestCookieIfNeeded(response, setGuestCookie)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, setGuestCookie, isAdmin } = await resolveConversation(request)
    const payload = await request.json().catch(() => ({}))

    const message = String(payload.message || '').trim()
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const requestedSender = payload.sender === 'support' ? 'support' : 'user'
    const sender: ChatSender = isAdmin ? requestedSender : 'user'

    const store = await loadStore()

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId,
      message,
      sender,
      timestamp: new Date().toISOString(),
      read: false,
    }

    store.messages.push(newMessage)

    let supportReply: ChatMessage | null = null
    if (sender === 'user') {
      supportReply = {
        id: crypto.randomUUID(),
        conversationId,
        message: generateSupportReply(message),
        sender: 'support',
        timestamp: new Date().toISOString(),
        read: false,
      }
      store.messages.push(supportReply)
    }

    await saveStore(store)

    const response = NextResponse.json({
      success: true,
      message: newMessage,
      reply: supportReply,
    })

    return attachGuestCookieIfNeeded(response, setGuestCookie)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { conversationId, setGuestCookie } = await resolveConversation(request)
    const payload = await request.json().catch(() => ({}))
    const messageIds = Array.isArray(payload.messageIds) ? payload.messageIds.map(String) : null

    const store = await loadStore()
    store.messages = store.messages.map((msg) => {
      if (msg.conversationId !== conversationId) return msg
      if (msg.sender !== 'support') return msg
      if (messageIds && !messageIds.includes(msg.id)) return msg
      return { ...msg, read: true }
    })

    await saveStore(store)

    const response = NextResponse.json({ success: true, message: 'Messages marked as read' })
    return attachGuestCookieIfNeeded(response, setGuestCookie)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
