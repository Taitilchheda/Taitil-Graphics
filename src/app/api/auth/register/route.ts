import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint is retired. Use /api/auth/otp/send and /api/auth/otp/verify for signup.',
    },
    { status: 410 }
  )
}
