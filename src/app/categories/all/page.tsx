import AllProductsClient from '@/components/categories/AllProductsClient'
import { getFullCatalog } from '@/lib/server-fetchers/products'

export const revalidate = 60

export default async function AllProductsPage() {
  const { products, categories } = await getFullCatalog()
  const categoryList = categories.map((c) => ({ id: c.id, name: c.name }))

  return <AllProductsClient products={products} categories={categoryList} />
}
