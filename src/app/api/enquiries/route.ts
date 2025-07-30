import { NextRequest, NextResponse } from 'next/server'
import { db, Enquiry } from '@/lib/database'
import { emailService } from '@/lib/email'

// Create new enquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      phone, 
      subject, 
      message, 
      productId, 
      productName,
      source = 'website',
      userId 
    } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create enquiry
    const enquiryData = {
      userId,
      productId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new' as const,
      source: source as 'website' | 'whatsapp' | 'email' | 'phone'
    }

    const enquiry = await db.createEnquiry(enquiryData)

    // Send email notifications
    try {
      // Send confirmation to customer
      await emailService.sendEnquiryConfirmation(email, {
        name,
        subject,
        message,
        productName
      })

      // Send notification to admin
      await emailService.sendEnquiryNotification({
        name,
        email,
        phone,
        subject,
        message,
        source,
        productName
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the enquiry creation if email fails
    }

    return NextResponse.json({
      success: true,
      enquiry: {
        id: enquiry.id,
        status: enquiry.status,
        createdAt: enquiry.createdAt
      },
      message: 'Enquiry submitted successfully'
    })
  } catch (error) {
    console.error('Enquiry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit enquiry' },
      { status: 500 }
    )
  }
}

// Get enquiries (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // In production, add authentication check for admin
    // const user = await getAuthenticatedUser(request)
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Mock enquiries for demo
    const mockEnquiries = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        subject: 'Business Card Design',
        message: 'I need custom business cards for my startup.',
        status: 'new',
        source: 'website',
        productName: 'Premium Business Cards',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        subject: 'Logo Design Enquiry',
        message: 'Looking for a professional logo for my restaurant.',
        status: 'contacted',
        source: 'whatsapp',
        productName: 'Custom Logo Design',
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        subject: 'Wedding Invitations',
        message: 'Need elegant wedding invitations for 150 guests.',
        status: 'quoted',
        source: 'website',
        productName: 'Wedding Invitations',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-19')
      }
    ]

    let filteredEnquiries = mockEnquiries

    // Apply filters
    if (status && status !== 'all') {
      filteredEnquiries = filteredEnquiries.filter(e => e.status === status)
    }

    if (source && source !== 'all') {
      filteredEnquiries = filteredEnquiries.filter(e => e.source === source)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEnquiries = filteredEnquiries.slice(startIndex, endIndex)

    return NextResponse.json({
      enquiries: paginatedEnquiries,
      total: filteredEnquiries.length,
      page,
      limit,
      hasMore: endIndex < filteredEnquiries.length,
      stats: {
        total: mockEnquiries.length,
        new: mockEnquiries.filter(e => e.status === 'new').length,
        contacted: mockEnquiries.filter(e => e.status === 'contacted').length,
        quoted: mockEnquiries.filter(e => e.status === 'quoted').length,
        converted: mockEnquiries.filter(e => e.status === 'converted').length,
        closed: mockEnquiries.filter(e => e.status === 'closed').length
      }
    })
  } catch (error) {
    console.error('Get enquiries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enquiries' },
      { status: 500 }
    )
  }
}

// Update enquiry status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes, assignedTo } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Enquiry ID and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['new', 'contacted', 'quoted', 'converted', 'closed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // In production, update in database
    // const enquiry = await db.updateEnquiry(id, { status, notes, assignedTo })

    return NextResponse.json({
      success: true,
      message: 'Enquiry updated successfully'
    })
  } catch (error) {
    console.error('Update enquiry error:', error)
    return NextResponse.json(
      { error: 'Failed to update enquiry' },
      { status: 500 }
    )
  }
}
