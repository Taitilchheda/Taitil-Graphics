import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'
import CategoryContactActions from '@/components/categories/CategoryContactActions'
import { getFullCatalog } from '@/lib/server-fetchers/products'

export const revalidate = 60

type Props = { params: Promise<{ category: string; subcategory: string }> }

export default async function SubcategoryPage({ params }: Props) {
  const { category: categoryId, subcategory: subcategoryId } = await params
  const { categories, products } = await getFullCatalog()
  const category = categories.find((c) => c.id === categoryId)
  const subcategory = category?.subcategories.find((s) => s.id === subcategoryId)
  if (!category || !subcategory) notFound()

  const subcategoryProducts = products.filter(
    (p) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p.category === categoryId || (p as any).categoryId === categoryId) &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p.subcategory === subcategoryId || (p as any).subcategoryId === subcategoryId)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <Link href="/categories/all" className="hover:text-teal-600">Categories</Link>
          <span>/</span>
          <Link href={`/categories/${category.id}`} className="hover:text-teal-600">{category.name}</Link>
          <span>/</span>
          <span className="text-gray-900">{subcategory.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{subcategory.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{subcategory.description}</p>

          <CategoryContactActions categoryId={category.id} categoryName={subcategory.name} />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Products</h2>
          <p className="text-gray-600">
            Choose from our {subcategoryProducts.length} product{subcategoryProducts.length === 1 ? '' : 's'} in this subcategory
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {subcategoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
