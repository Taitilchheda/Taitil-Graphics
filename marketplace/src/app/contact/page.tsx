'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Mail, MapPin, Phone, MessageCircle, Clock } from 'lucide-react'

const addressLines = [
  'B 403, Saraswati Apartment',
  'C S Complex Road No 4',
  'Behind Shakti Nagar',
  'Dahisar East, Mumbai 400068',
]

const addressText = addressLines.join(', ')
const mapQuery = encodeURIComponent(`Taitil Graphics, ${addressText}`)

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/40 to-secondary-100/50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                Contact Taitil Graphics
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">We’re here to help you order faster.</h1>
              <p className="text-gray-600">
                Reach us for product enquiries, bulk orders, or custom printing. We reply quickly on WhatsApp and email.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card flex gap-3 items-start">
                <Phone className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">+91 7666 24 7666</p>
                </div>
              </div>
              <div className="card flex gap-3 items-start">
                <Mail className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">taitilgraphics@gmail.com</p>
                </div>
              </div>
              <div className="card flex gap-3 items-start">
                <MessageCircle className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-sm text-gray-600">Chat for quick quotes & bulk orders</p>
                </div>
              </div>
              <div className="card flex gap-3 items-start">
                <Clock className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Hours</p>
                  <p className="text-sm text-gray-600">Mon–Sat · 10:00 AM – 8:00 PM</p>
                </div>
              </div>
            </div>

            <div className="card space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Studio address</p>
                  <p className="text-sm text-gray-600">{addressText}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/917666247666?text=${encodeURIComponent('Hi Taitil Graphics, I have a query about a product.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-center"
                >
                  Message on WhatsApp
                </a>
                <a
                  href="mailto:taitilgraphics@gmail.com"
                  className="btn-secondary text-center"
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Find us on the map</h2>
              <p className="text-sm text-gray-600">Use the map below to get directions to our studio.</p>
            </div>
            <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              <iframe
                title="Taitil Graphics Map"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
