import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({
  title,
  description,
  href,
  image,
}: {
  title: string;
  description: string;
  href: string;
  image: string;
}) {
  return (
    <Link
      className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
      href={href}
    >
      <Image
        src={image || "/images/category-business.svg"}
        alt={title}
        width={600}
        height={360}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="h-40 w-full object-contain bg-white"
      />
      <div className="space-y-2 p-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-[var(--ink-soft)]">{description}</p>
        <span className="text-sm font-semibold text-[var(--accent-strong)]">
          Explore Products &gt;
        </span>
      </div>
    </Link>
  );
}
