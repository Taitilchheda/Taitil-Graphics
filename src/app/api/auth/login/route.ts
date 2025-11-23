import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials } from '@/lib/auth/mockUsers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = validateCredentials(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user,
      message: 'Login successful'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
