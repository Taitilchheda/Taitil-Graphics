import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  favourites,
  productImages,
  products,
  users,
} from "@/db/schema";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog-types";

type UserRecord = {
  id: number;
  name: string | null;
  email: string;
  passwordHash: string;
  role: string;
};

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] ?? null;
}

export async function createUser({
  name,
  email,
  passwordHash,
  role,
}: {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}) {
  const result = await db
    .insert(users)
    .values({ name, email, passwordHash, role })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

  return result[0];
}

export async function ensureAdminUser({
  email,
  passwordHash,
}: {
  email: string;
  passwordHash: string;
}) {
  const existing = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({
        role: "admin",
        passwordHash,
      })
      .where(eq(users.id, existing[0].id));
    return;
  }

  await db.insert(users).values({
    name: "Admin",
    email,
    passwordHash,
    role: "admin",
  });
}

export async function getCategories(): Promise<CatalogCategory[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      imageUrl: categories.imageUrl,
    })
    .from(categories)
    .orderBy(asc(categories.id));
  return rows.map((row: CatalogCategory) => ({
    ...row,
    imageUrl: row.imageUrl && row.imageUrl.trim() ? row.imageUrl : "/images/category-business.svg",
  }));
}

function mapProductRow(row: {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  badge: string | null;
  dateLabel: string | null;
  isNew: boolean;
  isFeatured: boolean;
  subcategory: string | null;
  subcategorySlug: string | null;
  categoryName: string;
  categorySlug: string;
}): CatalogProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    price: Number((row.priceCents / 100).toFixed(2)),
    rating: row.rating,
    reviewCount: row.reviewCount,
    imageUrl:
      row.imageUrl && row.imageUrl.trim()
        ? row.imageUrl
        : "/images/product-visit-1.svg",
    badge: row.badge,
    dateLabel: row.dateLabel,
    isNew: row.isNew,
    isFeatured: row.isFeatured,
    subcategory: row.subcategory,
    subcategorySlug: row.subcategorySlug,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
  };
}

async function getProductRows(whereClause?: ReturnType<typeof and>) {
  const query = db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: products.imageUrl,
      badge: products.badge,
      dateLabel: products.dateLabel,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      subcategory: products.subcategory,
      subcategorySlug: products.subcategorySlug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id));

  const withWhere = whereClause ? query.where(whereClause) : query;
  return withWhere.orderBy(desc(products.id));
}

export async function getProducts(): Promise<CatalogProduct[]> {
  const rows = await getProductRows();
  return rows.map(mapProductRow);
}

export async function getFeaturedProducts(limit = 4): Promise<CatalogProduct[]> {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: products.imageUrl,
      badge: products.badge,
      dateLabel: products.dateLabel,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      subcategory: products.subcategory,
      subcategorySlug: products.subcategorySlug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isFeatured, true))
    .orderBy(desc(products.id))
    .limit(limit);

  return rows.map(mapProductRow);
}

export async function getNewListings(limit = 3): Promise<CatalogProduct[]> {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: products.imageUrl,
      badge: products.badge,
      dateLabel: products.dateLabel,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      subcategory: products.subcategory,
      subcategorySlug: products.subcategorySlug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isNew, true))
    .orderBy(desc(products.id))
    .limit(limit);

  return rows.map(mapProductRow);
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<CatalogProduct[]> {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: products.imageUrl,
      badge: products.badge,
      dateLabel: products.dateLabel,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      subcategory: products.subcategory,
      subcategorySlug: products.subcategorySlug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(categories.slug, categorySlug))
    .orderBy(desc(products.id));

  return rows.map(mapProductRow);
}

export async function getProductsBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
): Promise<CatalogProduct[]> {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: products.imageUrl,
      badge: products.badge,
      dateLabel: products.dateLabel,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      subcategory: products.subcategory,
      subcategorySlug: products.subcategorySlug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(categories.slug, categorySlug),
        eq(products.subcategorySlug, subcategorySlug),
      ),
    )
    .orderBy(desc(products.id));

  return rows.map(mapProductRow);
}

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: products.imageUrl,
      badge: products.badge,
      dateLabel: products.dateLabel,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      subcategory: products.subcategory,
      subcategorySlug: products.subcategorySlug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  const productRow = rows[0];
  if (!productRow) {
    return null;
  }

  const images = await db
    .select({
      id: productImages.id,
      url: productImages.url,
      sortOrder: productImages.sortOrder,
    })
    .from(productImages)
    .where(eq(productImages.productId, productRow.id))
    .orderBy(asc(productImages.sortOrder));

  return {
    product: mapProductRow(productRow),
    images,
  };
}

export async function getFavouriteProductsByUserId(userId: number) {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      priceCents: products.priceCents,
      rating: products.rating,
      reviewCount: products.reviewCount,
      imageUrl: products.imageUrl,
      badge: products.badge,
      dateLabel: products.dateLabel,
      isNew: products.isNew,
      isFeatured: products.isFeatured,
      subcategory: products.subcategory,
      subcategorySlug: products.subcategorySlug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(favourites)
    .innerJoin(products, eq(favourites.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(favourites.userId, userId))
    .orderBy(desc(favourites.id));

  return rows.map(mapProductRow);
}

export async function addFavourite(userId: number, productId: number) {
  await db.insert(favourites).values({ userId, productId });
}

export async function removeFavourite(userId: number, productId: number) {
  await db
    .delete(favourites)
    .where(and(eq(favourites.userId, userId), eq(favourites.productId, productId)));
}

export async function isFavourite(userId: number, productId: number) {
  const rows = await db
    .select({ id: favourites.id })
    .from(favourites)
    .where(and(eq(favourites.userId, userId), eq(favourites.productId, productId)))
    .limit(1);
  return Boolean(rows[0]);
}
