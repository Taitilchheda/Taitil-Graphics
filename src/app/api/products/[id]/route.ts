import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ensureCategory = async (categoryId: string, categoryName?: string) => {
  const existing = await prisma.category.findUnique({ where: { id: categoryId } })
  if (existing) return existing
  return prisma.category.create({
    data: {
      id: categoryId,
      name: categoryName || categoryId,
      description: categoryName || categoryId,
    },
  })
}

const ensureSubcategory = async (subcategoryId: string | null, categoryId: string, subcategoryName?: string) => {
  if (!subcategoryId) return null
  const existing = await prisma.subcategory.findUnique({ where: { id: subcategoryId } })
  if (existing) return existing
  return prisma.subcategory.create({
    data: {
      id: subcategoryId,
      name: subcategoryName || subcategoryId,
      description: subcategoryName || subcategoryId,
      categoryId,
    },
  })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true, subcategory: true },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product GET error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      categoryId,
      categoryName,
      subcategoryId,
      subcategoryName,
      image,
      images,
      features,
      badges,
      isNew,
      isRecommended,
      isHotSeller,
      stock,
    } = body

    const category = await ensureCategory(categoryId, categoryName)
    const subcategory = await ensureSubcategory(subcategoryId, category.id, subcategoryName)

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        categoryId: category.id,
        subcategoryId: subcategory ? subcategory.id : null,
        image,
        images: images ? images : undefined,
        features: features ? features : undefined,
        badges: badges ? badges : undefined,
        isNew: isNew ?? undefined,
        isRecommended: isRecommended ?? undefined,
        isHotSeller: isHotSeller ?? undefined,
        stock,
      },
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error('Product PATCH error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Product DELETE error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
