import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { CartProvider } from '@/components/cart/CartProvider'
import CartSidebar from '@/components/cart/CartSidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Business Services Platform',
  description: 'Your one-stop solution for business essentials, office supplies, design services, and more.',
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
          <CartProvider>
            {children}
            <CartSidebar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
