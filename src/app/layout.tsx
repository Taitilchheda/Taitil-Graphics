import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { CatalogProvider } from '@/components/providers/CatalogProvider'
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider'
import { Toaster } from 'react-hot-toast'
import ChatbotButton from '@/components/ui/ChatbotButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Taitil Graphics - Professional Printing & Design Services',
  description: 'Your one-stop solution for visiting cards, wedding invitations, marketing materials, packaging, and custom design services.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <AnalyticsProvider>
                {children}
                <ChatbotButton />
                <Toaster
                  position="bottom-left"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#167450',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                      },
                    },
                  }}
                />
              </AnalyticsProvider>
            </CartProvider>
          </CatalogProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
