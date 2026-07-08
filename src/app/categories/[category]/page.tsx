import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'
import CategoryContactActions from '@/components/categories/CategoryContactActions'
import { getFullCatalog } from '@/lib/server-fetchers/products'

export const revalidate = 60

type Props = { params: Promise<{ category: string }> }

export default async function CategoryPage({ params }: Props) {
  const { category: categoryId } = await params
  const { categories, products } = await getFullCatalog()
  const category = categories.find((c) => c.id === categoryId)
  if (!category) notFound()

  const categoryProducts = products.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p) => p.category === categoryId || (p as any).categoryId === categoryId
  )

  const subcategoriesWithCount = category.subcategories.map((sub) => ({
    ...sub,
    productCount: categoryProducts.filter((p) => p.subcategory === sub.id).length,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <Link href="/categories/all" className="hover:text-teal-600">Categories</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{category.description}</p>

          <CategoryContactActions categoryId={category.id} categoryName={category.name} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {subcategoriesWithCount.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${category.id}/${sub.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{sub.name}</h3>
                <p className="text-gray-600 mb-4">{sub.description}</p>
                <div className="text-primary-600 font-medium">
                  {sub.productCount} product{sub.productCount === 1 ? '' : 's'} available
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Products</h2>
          <p className="text-gray-600">
            Choose from our {categoryProducts.length} product{categoryProducts.length === 1 ? '' : 's'} in this category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
