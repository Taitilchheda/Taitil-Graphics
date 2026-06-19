import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    error: 'Deprecated endpoint. Use /api/products instead.',
  }, { status: 410 })
}
