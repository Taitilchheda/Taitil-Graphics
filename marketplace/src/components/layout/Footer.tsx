'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, MessageCircle, Facebook, Instagram, Sparkles, Flame } from 'lucide-react'
import { useCatalog } from '@/components/providers/CatalogProvider'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { categories } = useCatalog()
  const primaryCategories = categories.slice(0, 4)
  const decorCategory = categories.find((cat) => cat.id === 'cake-decorations')

  const handleWhatsAppClick = () => {
    const message = "Hi! I'd like to know more about your printing services."
    const phoneNumber = '+917666247666'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <footer className="bg-[#505050] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="space-y-6">
            <div>
              <div className="text-2xl font-bold mb-4">
            <Image src="/logo white.svg" alt="Taitil Graphics Logo" width={80} height={80} className="h-20" />
          </div>
              <p className="text-gray-300 leading-relaxed">
                Your trusted partner for professional printing solutions. We provide high-quality 
                designing and printing services for businesses of all sizes.
              </p>
            </div>
            
            {/* Social Media Links */}
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/BRChheda" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/taitil_graphics/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              {primaryCategories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/categories/${cat.id}`} className="text-gray-300 hover:text-teal-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categories/all" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Browse all products
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products/standard-visiting-cards" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Business Cards
                </Link>
              </li>
              <li>
                <Link href="/products/flyers" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Flyers & Brochures
                </Link>
              </li>
              <li>
                <Link href="/products/banners" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Banners & Signage
                </Link>
              </li>
              <li>
                <Link href="/products/letterheads" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Letterheads
                </Link>
              </li>
              <li>
                <Link href="/products/t-shirts" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Custom Apparel
                </Link>
              </li>
              <li>
                <Link href="/categories/cake-decorations" className="text-gray-300 hover:text-teal-400 transition-colors flex items-center space-x-2">
                  <span>Cake decor & toppers</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    <a href="tel:+917666247666" className="hover:text-teal-400 transition-colors">
                      +91 7666 24 7666
                    </a>
                  </p>
                  <p className="text-sm text-gray-400">Call for instant support</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    <a href="mailto:taitilgraphics@gmail.com" className="hover:text-teal-400 transition-colors">
                      taitilgraphics@gmail.com
                    </a>
                  </p>
                  <p className="text-sm text-gray-400">Email us your queries</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    B 403, Saraswati apartment,<br />
                    C S complex road no 4, <br />
                    Behind Shakti Nagar<br />
                    Dahisar East
                    Mumbai 400068
                    Mumbai, Maharashtra
                  </p>
                  <p className="text-sm text-gray-400">Visit our office</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">
                    Mon - Sun: 10:00 AM - 7:00 PM<br />
                  </p>
                  <p className="text-sm text-gray-400">Business hours</p>
                </div>
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 w-full justify-center"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} Taitil Graphics. All rights reserved.
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-teal-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-teal-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund-policy" className="text-gray-400 hover:text-teal-400 transition-colors">
                Refund Policy
              </Link>
              <Link href="/shipping-policy" className="text-gray-400 hover:text-teal-400 transition-colors">
                Shipping Policy
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-teal-400 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center items-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
