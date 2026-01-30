'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useCart } from '@/components/providers/CartProvider'
import Header from '@/components/layout/Header'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const { user, isLoading } = useAuth()
  const { cartItems, updateQuantity, removeFromCart, cartItemCount, cartTotal, hasPricedItems, hasUnpricedItems } = useCart()
  const inrSymbol = String.fromCharCode(8377)

  const isAdmin = user?.role === 'admin'
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Sign in required</h1>
          <p className="text-gray-600">Please log in to access your cart and checkout.</p>
          <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2 justify-center">Sign in</Link>
        </main>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Cart disabled for admin</h1>
          <p className="text-gray-600">Admin accounts don&apos;t use the shopper cart. Manage catalog and orders from the dashboard.</p>
          <Link href="/admin" className="btn-primary inline-flex items-center gap-2 justify-center">
            Go to admin
          </Link>
        </main>
      </div>
    )
  }

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
          {isAdmin && (
            <p className="text-sm text-gray-600 mt-1">
              Admin logged in. Use the admin dashboard for catalog/orders. This cart is for retailer shoppers.
            </p>
          )}
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
                            src={item.image || '/logo.svg'}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-contain bg-white"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <div className="text-sm text-gray-500 mb-2 space-y-1">
                            {item.mrpCents && item.mrpCents > 0 ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">MRP</span>
                                  <span className="line-through">{inrSymbol}{Math.round(item.mrpCents / 100).toLocaleString('en-IN')}</span>
                                  {item.discountPercent ? (
                                    <span className="text-xs text-emerald-600">{item.discountPercent}% off</span>
                                  ) : null}
                                </div>
                                <div className="text-xs text-gray-600">Price: {inrSymbol}{Math.round((item.priceCents || 0) / 100).toLocaleString('en-IN')}</div>
                                <div className="text-xs text-gray-500">GST included</div>
                              </>
                            ) : (
                              <div>Contact for pricing</div>
                            )}
                          </div>
                          
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
                            {item.priceCents && item.priceCents > 0
                              ? `${inrSymbol}${Math.round(item.priceCents * item.quantity / 100).toLocaleString('en-IN')}`
                              : 'Quote Required'}
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

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{inrSymbol}{Math.round(cartTotal / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span>Total (GST included)</span>
                    <span>{inrSymbol}{Math.round(cartTotal / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-gray-500">Prices are inclusive of GST.</div>
                </div>

                {hasUnpricedItems && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Some items do not have a price yet. Please update pricing before checkout.
                  </div>
                )}

                <div className="space-y-3 mt-6">
                  <Link
                    href="/checkout"
                    className={`w-full text-center block rounded-lg py-3 px-4 font-semibold transition-colors ${hasUnpricedItems || !hasPricedItems ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600 text-white'}`}
                    aria-disabled={hasUnpricedItems || !hasPricedItems}
                    onClick={(e) => {
                      if (hasUnpricedItems || !hasPricedItems) e.preventDefault()
                    }}
                  >
                    Proceed to Checkout
                  </Link>

                  <Link
                    href="/categories/all"
                    className="w-full text-center block rounded-lg border border-gray-200 bg-white text-primary-600 font-medium py-2 px-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Continue Shopping
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span>Secure Checkout</span>
                    <span>24/7 Support</span>
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
