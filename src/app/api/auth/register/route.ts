import { NextRequest, NextResponse } from 'next/server'

// Mock user database - in production, use a real database
let users = [
  {
    id: '1',
    email: 'customer@example.com',
    password: 'password123',
    name: 'John Customer'
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Check if user already exists
    const existingUser = users.find(u => u.email === email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password, // In production, hash this password
      name
    }

    users.push(newUser)

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Registration successful'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
