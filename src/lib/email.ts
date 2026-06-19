// Email service for sending notifications
// In production, integrate with services like SendGrid, Mailgun, or AWS SES

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface EmailData {
  to: string
  from?: string
  subject: string
  html?: string
  text?: string
  templateId?: string
  templateData?: Record<string, any>
}

class EmailService {
  private fromEmail = process.env.FROM_EMAIL || 'noreply@businessservices.com'
  private apiKey = process.env.EMAIL_API_KEY

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      // In production, replace with actual email service
      console.log('📧 Email would be sent:', {
        to: data.to,
        from: data.from || this.fromEmail,
        subject: data.subject,
        preview: data.text?.substring(0, 100) || data.html?.substring(0, 100)
      })

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = this.getWelcomeTemplate(userName)
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendOrderConfirmation(userEmail: string, orderData: any): Promise<boolean> {
    const template = this.getOrderConfirmationTemplate(orderData)
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendEnquiryNotification(enquiryData: any): Promise<boolean> {
    const template = this.getEnquiryNotificationTemplate(enquiryData)
    
    return this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@businessservices.com',
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendEnquiryConfirmation(userEmail: string, enquiryData: any): Promise<boolean> {
    const template = this.getEnquiryConfirmationTemplate(enquiryData)
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  async sendPasswordReset(userEmail: string, resetToken: string): Promise<boolean> {
    const template = this.getPasswordResetTemplate(resetToken)
    
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  }

  private getWelcomeTemplate(userName: string): EmailTemplate {
    const subject = 'Welcome to Business Services Platform!'
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BSP!</h1>
        </div>
        
        <div style="padding: 40px 20px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${userName}!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining Business Services Platform. We're excited to help you with all your business needs.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">What you can do:</h3>
            <ul style="color: #475569; line-height: 1.8;">
              <li>Browse our extensive catalog of business services</li>
              <li>Get instant quotes via WhatsApp</li>
              <li>Track your projects and orders</li>
              <li>Save your favorite products</li>
              <li>Chat with our support team</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Exploring
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      </div>
    `
    
    const text = `
      Welcome to Business Services Platform!
      
      Hello ${userName}!
      
      Thank you for joining Business Services Platform. We're excited to help you with all your business needs.
      
      What you can do:
      - Browse our extensive catalog of business services
      - Get instant quotes via WhatsApp
      - Track your projects and orders
      - Save your favorite products
      - Chat with our support team
      
      Start exploring: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}
      
      If you have any questions, feel free to contact our support team.
    `
    
    return { subject, html, text }
  }

  private getOrderConfirmationTemplate(orderData: any): EmailTemplate {
    const subject = `Order Confirmation - ${orderData.orderNumber}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
          <p style="color: white; margin: 10px 0 0 0;">Order #${orderData.orderNumber}</p>
        </div>
        
        <div style="padding: 30px 20px; background: #f8fafc;">
          <p style="color: #475569; margin-bottom: 20px;">
            Thank you for your order! We've received your request and will begin processing it shortly.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Total:</strong> $${orderData.total}</p>
            <p><strong>Status:</strong> ${orderData.status}</p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            We'll send you updates as your order progresses. You can also track your order in your account dashboard.
          </p>
        </div>
      </div>
    `
    
    const text = `
      Order Confirmed!
      Order #${orderData.orderNumber}
      
      Thank you for your order! We've received your request and will begin processing it shortly.
      
      Order Details:
      Order Number: ${orderData.orderNumber}
      Total: $${orderData.total}
      Status: ${orderData.status}
      
      We'll send you updates as your order progresses.
    `
    
    return { subject, html, text }
  }

  private getEnquiryNotificationTemplate(enquiryData: any): EmailTemplate {
    const subject = `New Enquiry: ${enquiryData.subject}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Customer Enquiry</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${enquiryData.name}</p>
          <p><strong>Email:</strong> ${enquiryData.email}</p>
          <p><strong>Phone:</strong> ${enquiryData.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${enquiryData.subject}</p>
          <p><strong>Message:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px;">${enquiryData.message}</p>
          <p><strong>Source:</strong> ${enquiryData.source}</p>
          <p><strong>Product:</strong> ${enquiryData.productName || 'General enquiry'}</p>
        </div>
      </div>
    `
    
    const text = `
      New Customer Enquiry
      
      Name: ${enquiryData.name}
      Email: ${enquiryData.email}
      Phone: ${enquiryData.phone || 'Not provided'}
      Subject: ${enquiryData.subject}
      Message: ${enquiryData.message}
      Source: ${enquiryData.source}
      Product: ${enquiryData.productName || 'General enquiry'}
    `
    
    return { subject, html, text }
  }

  private getEnquiryConfirmationTemplate(enquiryData: any): EmailTemplate {
    const subject = 'We received your enquiry!'
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank You!</h1>
        </div>
        
        <div style="padding: 30px 20px; background: #f8fafc;">
          <p style="color: #475569; margin-bottom: 20px;">
            Hi ${enquiryData.name},
          </p>
          
          <p style="color: #475569; margin-bottom: 20px;">
            Thank you for your enquiry about "${enquiryData.subject}". We've received your message and our team will get back to you within 24 hours.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Enquiry:</h3>
            <p style="background: #f1f5f9; padding: 15px; border-radius: 4px;">${enquiryData.message}</p>
          </div>
          
          <p style="color: #475569;">
            For immediate assistance, you can also contact us via WhatsApp at +1234567890.
          </p>
        </div>
      </div>
    `
    
    const text = `
      Thank You!
      
      Hi ${enquiryData.name},
      
      Thank you for your enquiry about "${enquiryData.subject}". We've received your message and our team will get back to you within 24 hours.
      
      Your Enquiry: ${enquiryData.message}
      
      For immediate assistance, you can also contact us via WhatsApp at +1234567890.
    `
    
    return { subject, html, text }
  }

  private getPasswordResetTemplate(resetToken: string): EmailTemplate {
    const subject = 'Reset Your Password'
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        
        <div style="padding: 30px 20px; background: #f8fafc;">
          <p style="color: #475569; margin-bottom: 20px;">
            You requested to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link: ${resetUrl}
          </p>
        </div>
      </div>
    `
    
    const text = `
      Password Reset
      
      You requested to reset your password. Use this link to create a new password:
      ${resetUrl}
      
      This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
    `
    
    return { subject, html, text }
  }
}

export const emailService = new EmailService()
