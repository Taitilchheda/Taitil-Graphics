# 🚀 Complete Setup Guide for Taitil Graphics Platform

This guide will walk you through setting up the complete business platform with AI-powered chat and admin dashboard.

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- A code editor (VS Code recommended)

## 🛠 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Navigate to the project directory
cd Taitil-Graphics

# Install all dependencies
npm install
```

### Step 2: Environment Configuration

The `.env.local` file is already created with default values. You can modify it if needed:

```env
# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEXTAUTH_SECRET=another-secret-key-for-nextauth-sessions

# Application URLs
NEXTAUTH_URL=http://localhost:3002
NODE_ENV=development

# Email Configuration (Optional - for contact forms)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Step 3: Start the Application

```bash
# Start the development server
npm run dev:next
```

The application will be available at: **http://localhost:3002** (or the next available port)

### Step 4: Verify Installation

1. **Main Website**: Open http://localhost:3002 (or your assigned port)
   - Should see the Taitil Graphics homepage
   - Chat widget should appear in bottom-right corner

2. **Chat Functionality**:
   - Click the chat widget
   - Send a message like "Hello"
   - Should receive an AI response within 2-3 seconds

3. **Admin Dashboard**: Open http://localhost:3002/admin/chat
   - Should see the chat management interface
   - Can view and respond to customer conversations

4. **Authentication**:
   - Test login with: customer@example.com / password123
   - Test admin access with: admin@example.com / admin123

## 🧪 Testing the Complete System

### Test 1: Customer Chat Experience

```bash
# 1. Open the main site
http://localhost:3000

# 2. Click the chat widget (bottom-right)
# 3. Send these test messages:
"Hello" → Should get welcome message
"What are your prices?" → Should get pricing information
"What services do you offer?" → Should get services overview
"How can I contact you?" → Should get contact details
```

### Test 2: Admin Dashboard

```bash
# 1. Open admin dashboard
http://localhost:3000/admin/chat

# 2. You should see:
- List of conversations on the left
- Chat interface on the right
- Real-time connection status
- Ability to respond to customers

# 3. Test real-time messaging:
- Open customer chat in one browser tab
- Open admin dashboard in another tab
- Send messages between them
- Verify real-time updates
```

### Test 3: Authentication System

```bash
# Test with default accounts:

Customer Account:
Email: customer@example.com
Password: password123

Admin Account:
Email: admin@example.com
Password: admin123

# 1. Try logging in at /auth/login
# 2. Verify JWT cookie is set
# 3. Test protected routes access
```

## 🔧 Configuration Options

### Socket.IO Configuration

The real-time chat is powered by Socket.IO. Configuration is in `server.js`:

```javascript
// Modify CORS origins for production
cors: {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001']
}
```

### AI Response Customization

Modify AI responses in `server.js` or `src/lib/database-service.ts`:

```javascript
// Add new response patterns
if (message.includes('your-keyword')) {
  return "Your custom response here"
}
```

### Rate Limiting

Adjust rate limits in `src/lib/middleware.ts`:

```javascript
// Login attempts: 5 per 15 minutes
withRateLimit(5, 15 * 60 * 1000)

// Registration: 3 per hour  
withRateLimit(3, 60 * 60 * 1000)

// Chat messages: 30 per minute
withRateLimit(30, 60 * 1000)
```

## 🚀 Production Deployment

### Option 1: Vercel (Frontend Only)

**Note**: Vercel doesn't support Socket.IO WebSockets. Use for static features only.

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Connect to Vercel
# 3. Add environment variables
# 4. Deploy
```

### Option 2: Railway/Render (Full Stack)

```bash
# 1. Connect GitHub repository
# 2. Set environment variables
# 3. Use start command: npm start
# 4. Deploy with Socket.IO support
```

### Option 3: VPS/Dedicated Server

```bash
# 1. Build the application
npm run build

# 2. Start production server
NODE_ENV=production npm start

# 3. Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "taitil-graphics"
```

## 🔍 Troubleshooting

### Issue: Chat not working

**Symptoms**: Messages not sending, no AI responses
**Solution**:
```bash
# 1. Ensure you're using the correct dev command
npm run dev  # ✅ Correct (includes Socket.IO)
# NOT: npm run dev:next  # ❌ Wrong (Next.js only)

# 2. Check browser console for errors
# 3. Verify Socket.IO connection in Network tab
```

### Issue: Authentication errors

**Symptoms**: Login fails, JWT errors
**Solution**:
```bash
# 1. Check JWT_SECRET in .env.local
# 2. Clear browser cookies
# 3. Restart development server
```

### Issue: Port conflicts

**Symptoms**: "Port 3000 is in use"
**Solution**:
```bash
# Kill existing processes
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Issue: Socket.IO connection failed

**Symptoms**: "WebSocket connection failed"
**Solution**:
```bash
# 1. Check if server.js is running
# 2. Verify CORS configuration
# 3. Check firewall settings
```

## 📊 Performance Monitoring

### Enable Debug Mode

```bash
# Enable Socket.IO debugging
DEBUG=socket.io* npm run dev

# Enable all debugging
DEBUG=* npm run dev
```

### Monitor Real-time Connections

Check the server console for:
```
User connected: <socket-id>
User joined: <user-id>
Message received: <message-preview>
```

## 🔐 Security Checklist

- [ ] JWT_SECRET is at least 32 characters
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] CORS is properly configured
- [ ] Passwords are hashed with bcrypt
- [ ] HTTP-only cookies are used

## 📈 Next Steps

### Upgrade to Real Database

1. Install Prisma:
```bash
npm install prisma @prisma/client
npx prisma init
```

2. Replace mock database in `src/lib/database-service.ts`

### Add More AI Features

1. Integrate OpenAI API for smarter responses
2. Add sentiment analysis
3. Implement conversation categorization

### Enhanced Admin Features

1. Add chat analytics
2. Implement canned responses
3. Add file sharing capabilities

## 🆘 Getting Help

If you encounter issues:

1. **Check the console**: Look for error messages in browser and server console
2. **Review logs**: Check the terminal where you ran `npm run dev`
3. **Test step by step**: Follow the testing guide above
4. **Check environment**: Verify all environment variables are set

## ✅ Success Checklist

Your setup is complete when:

- [ ] Main website loads at http://localhost:3000
- [ ] Chat widget appears and responds to messages
- [ ] Admin dashboard works at http://localhost:3000/admin/chat
- [ ] Real-time messaging works between customer and admin
- [ ] Authentication system allows login/logout
- [ ] No console errors in browser or terminal

**Congratulations!** 🎉 You now have a fully functional business platform with AI-powered chat support!
