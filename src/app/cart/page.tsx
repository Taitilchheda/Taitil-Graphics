'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useCart } from '@/components/cart/CartProvider'
import Header from '@/components/layout/Header'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { user } = useAuth()
  const { items, total, updateQuantity, removeItem, itemCount } = useCart()

  const subtotal = total
  const tax = total * 0.08 // 8% tax
  const shipping = total > 100 ? 0 : 15 // Free shipping over $100
  const finalTotal = subtotal + tax + shipping

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
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        {items.length === 0 ? (
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
                    {items.map((item) => (
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
                            ${item.price.toFixed(2)} each
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
                              onClick={() => removeItem(item.id)}
                              className="flex items-center space-x-1 text-red-500 hover:text-red-700 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ${(item.price * item.quantity).toFixed(2)}
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
                <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  {user ? (
                    <Link
                      href="/checkout"
                      className="w-full btn-primary text-center block"
                    >
                      Proceed to Checkout
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/auth/login?redirect=/checkout"
                        className="w-full btn-primary text-center block"
                      >
                        Sign In to Checkout
                      </Link>
                      <p className="text-xs text-gray-500 text-center">
                        Or <Link href="/auth/register" className="text-primary-600 hover:text-primary-700">create an account</Link>
                      </p>
                    </div>
                  )}
                  
                  <Link
                    href="/"
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
