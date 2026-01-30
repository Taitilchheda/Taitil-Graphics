export type CatalogCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  categoryName: string;
  categorySlug: string;
  subcategory?: string | null;
  subcategorySlug?: string | null;
  imageUrl: string;
  badge?: string | null;
  dateLabel?: string | null;
  isNew?: boolean | null;
  isFeatured?: boolean | null;
};

export type CartProduct = Pick<
  CatalogProduct,
  "id" | "name" | "price" | "categoryName" | "imageUrl"
>;
