const { PrismaClient } = require('@prisma/client')

const resolveHsnCode = ({ categoryId, subcategoryId, name }) => {
  const haystack = [categoryId, subcategoryId, name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  if (!haystack) return undefined
  if (haystack.includes('paper') && haystack.includes('topper')) return '4911'
  if (haystack.includes('paper-toppers') || haystack.includes('premium-paper')) return '4911'
  if (haystack.includes('acrylic')) return '3926'
  return undefined
}

const prisma = new PrismaClient()

const main = async () => {
  const products = await prisma.product.findMany({
    select: { id: true, hsnCode: true, categoryId: true, subcategoryId: true, name: true },
  })

  let updated = 0
  for (const product of products) {
    if (product.hsnCode) continue
    const resolved = resolveHsnCode({
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      name: product.name,
    })
    if (!resolved) continue
    await prisma.product.update({
      where: { id: product.id },
      data: { hsnCode: resolved },
    })
    updated += 1
  }

  console.log(`HSN backfill complete. Updated ${updated} products.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
