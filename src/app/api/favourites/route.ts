import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (!auth?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ error: 'Deprecated endpoint. Likes are stored locally for now.' }, { status: 410 })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (!auth?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ error: 'Deprecated endpoint. Likes are stored locally for now.' }, { status: 410 })
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (!auth?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ error: 'Deprecated endpoint. Likes are stored locally for now.' }, { status: 410 })
}
