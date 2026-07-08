'use client'

import dynamic from 'next/dynamic'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Heavy client widgets — chat + analytics — that don't need to be in the
// initial bundle. They render only after the page paints, on idle.
const ChatbotButton = dynamic(() => import('@/components/ui/ChatbotButton'), {
  ssr: false,
  loading: () => null,
})
const WhatsAppFloat = dynamic(() => import('@/components/whatsapp-float'), {
  ssr: false,
  loading: () => null,
})

export default function ClientExtras() {
  return (
    <>
      <ChatbotButton />
      <WhatsAppFloat />
      <SpeedInsights />
    </>
  )
}
