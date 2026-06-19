require("dotenv").config();
const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const categories = [
  {
    name: "Business Essentials",
    slug: "business-essentials",
    description: "Professional business stationery and essentials.",
    imageUrl: "/images/category-business.svg",
  },
  {
    name: "Celebrations",
    slug: "celebrations",
    description: "Invitations, cards, and celebration decor.",
    imageUrl: "/images/category-celebrations.svg",
  },
  {
    name: "Marketing Material",
    slug: "marketing-material",
    description: "Promotional materials for marketing campaigns.",
    imageUrl: "/images/category-marketing.svg",
  },
  {
    name: "Packaging",
    slug: "packaging",
    description: "Premium packaging, labels, and branded boxes.",
    imageUrl: "/images/category-packaging.svg",
  },
  {
    name: "Gift Articles",
    slug: "gift-articles",
    description: "Gifting essentials and custom merchandise.",
    imageUrl: "/images/category-gift.svg",
  },
  {
    name: "Cake Decoration",
    slug: "cake-decorations",
    description: "Cake toppers and celebration decoration materials.",
    imageUrl: "/images/category-cake.svg",
  },
];

const products = [
  {
    name: "Standard Visiting Cards",
    slug: "standard-visiting-cards",
    description:
      "Classic business cards with a premium matte finish and crisp typography.",
    price: 750,
    rating: 5,
    reviewCount: 120,
    categorySlug: "business-essentials",
    subcategory: "Visiting Cards",
    subcategorySlug: "visiting-cards",
    imageUrl: "/images/product-visit-1.svg",
    isFeatured: true,
  },
  {
    name: "Rounded Corner Cards",
    slug: "rounded-corner-cards",
    description: "Modern visiting cards with elegant rounded corners.",
    price: 890,
    rating: 5,
    reviewCount: 120,
    categorySlug: "business-essentials",
    subcategory: "Visiting Cards",
    subcategorySlug: "visiting-cards",
    imageUrl: "/images/product-visit-2.svg",
    isFeatured: true,
  },
  {
    name: "Premium Paper Cake Topper #1",
    slug: "premium-paper-cake-topper-1",
    description:
      "Layered cardstock topper with shimmer foil finish. Ready to ship.",
    price: 450,
    rating: 5,
    reviewCount: 95,
    categorySlug: "cake-decorations",
    subcategory: "Premium Paper Cake Toppers",
    subcategorySlug: "premium-paper-cake-toppers",
    imageUrl: "/images/product-cake-1.svg",
    badge: "New listing",
    dateLabel: "25/01/2026",
    isNew: true,
    isFeatured: true,
  },
  {
    name: "Premium Paper Cake Topper #2",
    slug: "premium-paper-cake-topper-2",
    description:
      "Ready-made layered cardstock topper with shimmer foil finish.",
    price: 480,
    rating: 5,
    reviewCount: 88,
    categorySlug: "cake-decorations",
    subcategory: "Premium Paper Cake Toppers",
    subcategorySlug: "premium-paper-cake-toppers",
    imageUrl: "/images/product-cake-2.svg",
    badge: "New listing",
    dateLabel: "24/01/2026",
    isNew: true,
  },
  {
    name: "Turquoise Butterfly Cake Decoration",
    slug: "turquoise-butterfly-cake-decoration",
    description:
      "Butterfly cake decorations with premium paper stock and vibrant inks.",
    price: 350,
    rating: 5,
    reviewCount: 110,
    categorySlug: "cake-decorations",
    subcategory: "Butterfly Decorations",
    subcategorySlug: "butterfly-decorations",
    imageUrl: "/images/product-cake-3.svg",
    badge: "New listing",
    dateLabel: "26/11/2025",
    isNew: true,
  },
  {
    name: "Classic Letterheads",
    slug: "classic-letterheads",
    description:
      "Premium letterheads for corporate communications and proposals.",
    price: 1190,
    rating: 5,
    reviewCount: 76,
    categorySlug: "business-essentials",
    subcategory: "Letterheads",
    subcategorySlug: "letterheads",
    imageUrl: "/images/product-letterhead.svg",
    isFeatured: true,
  },
  {
    name: "Luxury Celebration Invite",
    slug: "luxury-celebration-invite",
    description: "Acrylic and paper invitation suite for premium events.",
    price: 1490,
    rating: 5,
    reviewCount: 62,
    categorySlug: "celebrations",
    subcategory: "Invitations",
    subcategorySlug: "invitations",
    imageUrl: "/images/product-celebration.svg",
    isFeatured: true,
  },
  {
    name: "Marketing Flyers",
    slug: "marketing-flyers",
    description: "High-impact flyers and brochures for campaigns and launches.",
    price: 990,
    rating: 5,
    reviewCount: 54,
    categorySlug: "marketing-material",
    subcategory: "Flyers & Brochures",
    subcategorySlug: "flyers",
    imageUrl: "/images/product-marketing.svg",
    isFeatured: true,
  },
  {
    name: "Luxury Packaging Box",
    slug: "luxury-packaging-box",
    description: "Rigid boxes with premium lamination and custom inserts.",
    price: 1890,
    rating: 5,
    reviewCount: 41,
    categorySlug: "packaging",
    subcategory: "Boxes",
    subcategorySlug: "boxes",
    imageUrl: "/images/product-packaging.svg",
    isFeatured: true,
  },
  {
    name: "Custom Gift Mug Set",
    slug: "custom-gift-mug-set",
    description: "Personalized ceramic mugs with full-wrap design printing.",
    price: 690,
    rating: 5,
    reviewCount: 39,
    categorySlug: "gift-articles",
    subcategory: "Mugs",
    subcategorySlug: "mugs",
    imageUrl: "/images/product-gift.svg",
  },
];

const productImages = {
  "premium-paper-cake-topper-1": [
    "/images/product-cake-1.svg",
    "/images/product-cake-2.svg",
    "/images/product-cake-3.svg",
  ],
  "premium-paper-cake-topper-2": [
    "/images/product-cake-2.svg",
    "/images/product-cake-1.svg",
  ],
};

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const categoryIdMap = new Map();

  for (const category of categories) {
    const result = await client.query(
      `INSERT INTO categories (name, slug, description, image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug)
       DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url
       RETURNING id`,
      [category.name, category.slug, category.description, category.imageUrl],
    );
    categoryIdMap.set(category.slug, result.rows[0].id);
  }

  for (const product of products) {
    const categoryId = categoryIdMap.get(product.categorySlug);
    const result = await client.query(
      `INSERT INTO products (name, slug, description, price_cents, rating, review_count, category_id, subcategory, subcategory_slug, image_url, badge, date_label, is_featured, is_new)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (slug)
       DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, price_cents = EXCLUDED.price_cents, rating = EXCLUDED.rating, review_count = EXCLUDED.review_count, category_id = EXCLUDED.category_id, subcategory = EXCLUDED.subcategory, subcategory_slug = EXCLUDED.subcategory_slug, image_url = EXCLUDED.image_url, badge = EXCLUDED.badge, date_label = EXCLUDED.date_label, is_featured = EXCLUDED.is_featured, is_new = EXCLUDED.is_new
       RETURNING id`,
      [
        product.name,
        product.slug,
        product.description,
        Math.round(product.price * 100),
        product.rating,
        product.reviewCount,
        categoryId,
        product.subcategory,
        product.subcategorySlug,
        product.imageUrl,
        product.badge || null,
        product.dateLabel || null,
        product.isFeatured || false,
        product.isNew || false,
      ],
    );

    const productId = result.rows[0].id;
    await client.query("DELETE FROM product_images WHERE product_id = $1", [
      productId,
    ]);
    if (productImages[product.slug]) {
      for (let index = 0; index < productImages[product.slug].length; index += 1) {
        await client.query(
          `INSERT INTO product_images (product_id, url, sort_order)
           VALUES ($1, $2, $3)`,
          [productId, productImages[product.slug][index], index],
        );
      }
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET role = EXCLUDED.role`,
      ["Admin", adminEmail, passwordHash, "admin"],
    );
  }

  await client.end();
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
