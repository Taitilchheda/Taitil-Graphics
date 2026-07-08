import Image, { type ImageProps } from 'next/image'

/**
 * SmartImage wraps next/image with sensible defaults for the storefront:
 *  - AVIF/WebP via next.config.ts formats
 *  - placeholder: 'blur' with an inline 4x4 brand-tinted placeholder so
 *    cards paint something instead of a blank grey box while loading
 *
 * Pass `priority` for above-the-fold / LCP images; pass `sizes` whenever
 * the image renders at a responsive width.
 *
 * Data-URL images (e.g. base64 JPEGs accidentally stored in the DB)
 * are rejected and replaced with the brand logo — they can be 100+ KB
 * each and break the page. The DB should be cleaned up to use proper
 * URLs; this guard is a stopgap.
 *
 * IMPORTANT: This component is a Server Component on purpose. SmartImage
 * is rendered from RSC pages (homepage, category pages) and a Cloudinary
 * loader is wired up in next.config.ts — passing a `loader` function
 * from a Server Component to a Client Component is not allowed, so we
 * don't accept `loader` as a prop. Use next.config.ts to set the
 * global loader instead.
 */

const TINY_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0IDQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmNWY1ZjAiLz48L3N2Zz4='
const FALLBACK_SRC = '/logo.svg'

const isDataUrl = (src: unknown): boolean =>
  typeof src === 'string' && src.startsWith('data:')

type SmartImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL' | 'quality' | 'src' | 'loader'> & {
  src: ImageProps['src']
  /** Use a darker placeholder suited for light-on-dark hero sections. */
  dark?: boolean
  /** Quality 1-100, defaults to 75. */
  quality?: ImageProps['quality']
}

export default function SmartImage({
  quality = 75,
  src,
  ...rest
}: SmartImageProps) {
  const safeSrc = isDataUrl(src) ? FALLBACK_SRC : src
  return (
    <Image
      src={safeSrc}
      placeholder="blur"
      blurDataURL={TINY_BLUR}
      quality={quality}
      {...rest}
    />
  )
}
