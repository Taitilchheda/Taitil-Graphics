# Business Services Platform

A comprehensive Next.js web application for business services including design, printing, office supplies, and more. Features user authentication, product browsing, chat support, and WhatsApp integration.

## Features

### 🔐 Authentication System
- User registration and login
- Secure session management
- Protected routes for authenticated users

### 🏠 Landing Page
- Modern hero section with search functionality
- Logo positioned in top right
- Navigation menu with Projects, Favourites, and Account
- Responsive design for all devices

### 📂 Category Sections
- **Business Essentials**: Business cards, letterheads, envelopes, stamps
- **Office Supplies**: Stationery, filing solutions, desk accessories
- **Design & Logos**: Logo design, brand identity, marketing materials
- **Invitations & Announcements**: Wedding invitations, event cards
- **Packaging**: Product boxes, shopping bags, labels
- **Personalization**: Custom mugs, t-shirt printing, photo gifts

### 🛍️ Product Features
- Hoverable and expandable category sections
- Product cards with images and descriptions
- Star ratings and customer reviews
- WhatsApp enquiry buttons for direct contact
- Favorites system for saving products

### 💬 Chat System
- Real-time chat widget for customer support
- Minimizable chat interface
- Auto-replies for immediate response
- Message history and read status

### 📱 WhatsApp Integration
- Direct WhatsApp enquiry buttons on products
- Pre-filled messages with product details
- Customer information collection

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Authentication**: Custom auth system with localStorage
- **API**: Next.js API routes
- **Images**: Next.js Image optimization

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd business-services-platform
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── products/          # Product pages
│   ├── projects/          # User projects
│   ├── favourites/        # User favorites
│   ├── account/           # User account
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── sections/         # Page sections
│   ├── products/         # Product components
│   ├── chat/             # Chat components
│   └── providers/        # Context providers
└── styles/               # Global styles
```

## Demo Credentials

For testing the authentication system:

**Customer Account:**
- Email: customer@example.com
- Password: password123

**Admin Account:**
- Email: admin@example.com
- Password: admin123

## Features in Detail

### Authentication
- Sign up and sign in functionality
- Form validation and error handling
- Session persistence with localStorage
- Protected routes for authenticated users

### Product Browsing
- Category-based navigation
- Product search and filtering
- Detailed product pages
- Image galleries and descriptions

### WhatsApp Integration
- Replace `+1234567890` in the code with your actual WhatsApp Business number
- Customize message templates in the WhatsApp API route
- Product enquiry forms with customer details

### Chat System
- Real-time messaging interface
- Support for both user and admin messages
- Message timestamps and read status
- Expandable/collapsible chat widget

## Customization

### WhatsApp Number
Update the phone number in:
- `src/components/products/ProductCard.tsx`
- `src/app/api/whatsapp/route.ts`

### Styling
- Modify `tailwind.config.ts` for custom colors and themes
- Update `src/app/globals.css` for global styles
- Customize component styles in individual files

### Product Data
- Update mock data in `src/app/api/products/route.ts`
- Add real database integration for production

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
- Build the project: `npm run build`
- Start production server: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Use the chat widget in the application
- Contact via WhatsApp integration
- Submit issues on GitHub
