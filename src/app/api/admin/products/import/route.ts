import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

const parseCsv = (text: string) => {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
        continue
      }
      if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
    values.push(current)
    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim()
    })
    return row
  })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const csv = await request.text()
  const rows = parseCsv(csv)
  if (!rows.length) {
    return NextResponse.json({ error: 'No rows found' }, { status: 400 })
  }

  const created: string[] = []
  for (const row of rows) {
    if (!row.name || !row.categoryId) continue
    const category = await prisma.category.findUnique({ where: { id: row.categoryId } })
    if (!category) {
      await prisma.category.create({ data: { id: row.categoryId, name: row.categoryId, description: row.categoryId } })
    }
    const subcategoryId = row.subcategoryId || null
    if (subcategoryId) {
      const existingSub = await prisma.subcategory.findUnique({ where: { id: subcategoryId } })
      if (!existingSub) {
        await prisma.subcategory.create({
          data: { id: subcategoryId, name: subcategoryId, description: subcategoryId, categoryId: row.categoryId },
        })
      }
    }

    const type = (row.type || (row.categoryId === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE')) as 'PHYSICAL' | 'SERVICE'

    const product = await prisma.product.create({
      data: {
        name: row.name,
        description: row.description || row.name,
        categoryId: row.categoryId,
        subcategoryId,
        image: row.image || '/logo.svg',
        images: row.images ? row.images.split('|') : undefined,
        features: row.features ? row.features.split('|') : undefined,
        sku: row.sku || null,
        stock: row.stock ? Number(row.stock) : null,
        priceCents: row.priceCents ? Number(row.priceCents) : 0,
        listingPriceCents: row.listingPriceCents ? Number(row.listingPriceCents) : 0,
        discountPercent: row.discountPercent ? Number(row.discountPercent) : 0,
        reorderLevel: row.reorderLevel ? Number(row.reorderLevel) : 5,
        lowStockThreshold: row.lowStockThreshold ? Number(row.lowStockThreshold) : 5,
        type,
        seoTitle: row.seoTitle || null,
        seoDescription: row.seoDescription || null,
        canonicalUrl: row.canonicalUrl || null,
      },
    })
    created.push(product.id)
  }

  return NextResponse.json({ created })
}
