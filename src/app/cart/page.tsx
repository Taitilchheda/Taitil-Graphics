'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useCart } from '@/components/providers/CartProvider'
import Header from '@/components/layout/Header'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { user } = useAuth()
  const { cartItems, updateQuantity, removeFromCart, cartItemCount } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started.</p>
            <Link href="/" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-6">Cart Items</h2>
                  
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 pb-6 border-b border-gray-200 last:border-b-0">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Contact for pricing
                          </p>
                          
                          {/* Customizations */}
                          {item.customizations && Object.keys(item.customizations).length > 0 && (
                            <div className="mb-2">
                              {Object.entries(item.customizations).map(([key, value]) => (
                                <p key={key} className="text-xs text-gray-400">
                                  {key}: {String(value)}
                                </p>
                              ))}
                            </div>
                          )}
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              
                              <span className="px-3 py-1 bg-gray-100 rounded text-sm min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="flex items-center space-x-1 text-red-500 hover:text-red-700 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-lg text-primary-600">
                            Quote Required
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold mb-6">Get Your Quote</h2>

                <div className="space-y-4 mb-6">
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Custom Pricing</h3>
                    <p className="text-sm text-gray-600">
                      All our products are custom-made with personalized pricing based on your requirements, quantity, and specifications.
                    </p>
                  </div>

                  <div className="bg-primary-50 p-4 rounded-lg">
                    <h3 className="font-medium text-primary-800 mb-2">What's Included:</h3>
                    <ul className="text-sm text-primary-700 space-y-1">
                      <li>• Custom design consultation</li>
                      <li>• Premium quality materials</li>
                      <li>• Professional printing</li>
                      <li>• Fast turnaround time</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const message = `Hi! I'd like to get a quote for the following items:\n\n${cartItems.map(item => `• ${item.name} (Qty: ${item.quantity})`).join('\n')}\n\nPlease provide pricing and delivery details.`
                      window.open(`https://wa.me/917666247666?text=${encodeURIComponent(message)}`, '_blank')
                    }}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Get Quote on WhatsApp
                  </button>

                  <Link
                    href="/categories/all"
                    className="w-full btn-secondary text-center block"
                  >
                    Continue Shopping
                  </Link>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span>🔒 Secure Checkout</span>
                    <span>📞 24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
