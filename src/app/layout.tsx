import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { CatalogProvider } from '@/components/providers/CatalogProvider'
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider'
import ClientExtras from '@/components/ClientExtras'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Taitil Graphics - Professional Printing & Design Services',
  description: 'Your one-stop solution for visiting cards, wedding invitations, marketing materials, packaging, and custom design services.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon0.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', type: 'image/png' }
    ],
    apple: '/apple-icon.png'
  },
  manifest: '/manifest.json'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to the heaviest third-party origins. Lets the browser
            open the TLS handshake before the image element is parsed. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CatalogProvider>
            <CartProvider>
              <AnalyticsProvider>
                {children}
                <ClientExtras />
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
