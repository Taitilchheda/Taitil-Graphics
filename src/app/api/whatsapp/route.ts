import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { productName, customerName, customerEmail, message } = await request.json()

    // In a real application, you would integrate with WhatsApp Business API
    // For now, we'll just log the enquiry and return a WhatsApp URL

    const enquiry = {
      id: Date.now().toString(),
      productName,
      customerName,
      customerEmail,
      message,
      timestamp: new Date(),
      status: 'pending'
    }

    // Log the enquiry (in production, save to database)
    console.log('New WhatsApp enquiry:', enquiry)

    // Generate WhatsApp message
    const whatsappMessage = `Hi! I'm interested in ${productName}. 

Customer Details:
Name: ${customerName}
Email: ${customerEmail}

Message: ${message}

Please provide more information about pricing and availability.`

    // Your WhatsApp Business number (replace with actual number)
    const phoneNumber = '+1234567890'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`

    return NextResponse.json({
      success: true,
      whatsappUrl,
      enquiryId: enquiry.id,
      message: 'Enquiry processed successfully'
    })
  } catch (error) {
    console.error('WhatsApp enquiry error:', error)
    return NextResponse.json(
      { error: 'Failed to process enquiry' },
      { status: 500 }
    )
  }
}

// Get enquiry status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const enquiryId = searchParams.get('enquiryId')

    if (!enquiryId) {
      return NextResponse.json(
        { error: 'Enquiry ID is required' },
        { status: 400 }
      )
    }

    // In a real application, fetch from database
    return NextResponse.json({
      enquiryId,
      status: 'pending',
      message: 'Your enquiry has been received and will be processed shortly.'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
