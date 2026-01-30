# Deployment Guide - Business Services Platform

This guide covers deploying your complete business services platform to production.

## 🚀 Quick Deployment (Vercel)

### 1. Prepare for Deployment

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the build locally
npm start
```

### 2. Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/business-services-platform.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Deploy!

### 3. Environment Variables

Create these environment variables in your deployment platform:

```env
# Database
DATABASE_URL=your_database_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://yourdomain.com

# Email Service (SendGrid example)
EMAIL_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# WhatsApp Business
WHATSAPP_PHONE_NUMBER=+1234567890
WHATSAPP_API_TOKEN=your_whatsapp_token

# File Upload (Cloudinary example)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment (Stripe example)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get your database URL

2. **Set up tables**:
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR UNIQUE NOT NULL,
     name VARCHAR NOT NULL,
     password VARCHAR NOT NULL,
     phone VARCHAR,
     address TEXT,
     role VARCHAR DEFAULT 'customer',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     is_active BOOLEAN DEFAULT true,
     email_verified BOOLEAN DEFAULT false
   );

   -- Products table
   CREATE TABLE products (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR NOT NULL,
     description TEXT,
     long_description TEXT,
     image VARCHAR,
     images TEXT[],
     price VARCHAR,
     price_value DECIMAL,
     rating DECIMAL DEFAULT 0,
     reviews INTEGER DEFAULT 0,
     category VARCHAR,
     features TEXT[],
     tags TEXT[],
     sku VARCHAR UNIQUE,
     stock INTEGER DEFAULT 0,
     is_active BOOLEAN DEFAULT true,
     is_featured BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Orders table
   CREATE TABLE orders (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     order_number VARCHAR UNIQUE,
     status VARCHAR DEFAULT 'pending',
     items JSONB,
     subtotal DECIMAL,
     tax DECIMAL,
     shipping DECIMAL,
     total DECIMAL,
     shipping_address JSONB,
     billing_address JSONB,
     payment_method VARCHAR,
     payment_status VARCHAR DEFAULT 'pending',
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Enquiries table
   CREATE TABLE enquiries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     product_id UUID REFERENCES products(id),
     name VARCHAR NOT NULL,
     email VARCHAR NOT NULL,
     phone VARCHAR,
     subject VARCHAR NOT NULL,
     message TEXT NOT NULL,
     status VARCHAR DEFAULT 'new',
     source VARCHAR DEFAULT 'website',
     assigned_to UUID REFERENCES users(id),
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

### Option 2: PlanetScale

1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Use Prisma for schema management

### Option 3: MongoDB Atlas

1. Create account at [mongodb.com](https://mongodb.com)
2. Create cluster
3. Update database models to use MongoDB

## 📧 Email Service Setup

### SendGrid Setup

1. **Create SendGrid Account**:
   - Go to [sendgrid.com](https://sendgrid.com)
   - Create API key
   - Verify sender identity

2. **Update Email Service**:
   ```typescript
   // src/lib/email.ts
   import sgMail from '@sendgrid/mail'

   sgMail.setApiKey(process.env.EMAIL_API_KEY!)

   export const sendEmail = async (data: EmailData) => {
     try {
       await sgMail.send({
         to: data.to,
         from: process.env.FROM_EMAIL!,
         subject: data.subject,
         html: data.html,
         text: data.text
       })
       return true
     } catch (error) {
       console.error('Email error:', error)
       return false
     }
   }
   ```

## 💳 Payment Integration

### Stripe Setup

1. **Install Stripe**:
   ```bash
   npm install stripe @stripe/stripe-js
   ```

2. **Create Checkout API**:
   ```typescript
   // src/app/api/checkout/route.ts
   import Stripe from 'stripe'

   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

   export async function POST(request: Request) {
     const { items } = await request.json()

     const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       line_items: items.map(item => ({
         price_data: {
           currency: 'usd',
           product_data: {
             name: item.name,
             images: [item.image]
           },
           unit_amount: item.price * 100
         },
         quantity: item.quantity
       })),
       mode: 'payment',
       success_url: `${process.env.NEXTAUTH_URL}/success`,
       cancel_url: `${process.env.NEXTAUTH_URL}/cart`
     })

     return Response.json({ sessionId: session.id })
   }
   ```

## 🔒 Security Enhancements

### 1. Rate Limiting

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const limit = 10 // requests per minute
  const windowMs = 60 * 1000 // 1 minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 0,
      lastReset: Date.now()
    })
  }

  const ipData = rateLimitMap.get(ip)

  if (Date.now() - ipData.lastReset > windowMs) {
    ipData.count = 0
    ipData.lastReset = Date.now()
  }

  if (ipData.count >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  ipData.count += 1

  return NextResponse.next()
}
```

### 2. Input Validation

```typescript
// src/lib/validation.ts
import Joi from 'joi'

export const enquirySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional(),
  subject: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).max(1000).required()
})

export const validateEnquiry = (data: any) => {
  return enquirySchema.validate(data)
}
```

## 📊 Analytics Setup

### Google Analytics

1. **Install GA4**:
   ```bash
   npm install gtag
   ```

2. **Add to layout**:
   ```typescript
   // src/app/layout.tsx
   import Script from 'next/script'

   export default function RootLayout({ children }) {
     return (
       <html>
         <head>
           <Script
             src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
             strategy="afterInteractive"
           />
           <Script id="google-analytics" strategy="afterInteractive">
             {`
               window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
               gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
             `}
           </Script>
         </head>
         <body>{children}</body>
       </html>
     )
   }
   ```

## 🔧 Performance Optimization

### 1. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif']
  }
}
```

### 2. Caching

```typescript
// src/app/api/products/route.ts
export async function GET() {
  const products = await getProducts()
  
  return Response.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

## 🚀 Final Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] Email service configured
- [ ] WhatsApp number updated
- [ ] Payment integration tested
- [ ] SSL certificate enabled
- [ ] Domain configured
- [ ] Analytics tracking added
- [ ] Error monitoring setup (Sentry)
- [ ] Backup strategy implemented
- [ ] Performance monitoring enabled

## 📞 Support

For deployment issues:
1. Check the deployment logs
2. Verify environment variables
3. Test API endpoints
4. Check database connections
5. Review error monitoring tools

Your complete business services platform is now ready for production! 🎉
