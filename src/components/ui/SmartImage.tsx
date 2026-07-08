import Image, { type ImageProps } from 'next/image'
import { useMemo } from 'react'

/**
 * SmartImage wraps next/image with sensible defaults for the storefront:
 *  - AVIF/WebP via next.config.ts formats
 *  - placeholder: 'blur' with an inline 4x4 brand-tinted placeholder so
 *    cards paint something instead of a blank grey box while loading
 *  - optional Cloudinary loader if NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set
 *
 * Pass `priority` for above-the-fold / LCP images; pass `sizes` whenever
 * the image renders at a responsive width.
 *
 * Data-URL images (e.g. base64 JPEGs accidentally stored in the DB)
 * are rejected and replaced with the brand logo — they can be 100+ KB
 * each and break the page. The DB should be cleaned up to use proper
 * URLs; this guard is a stopgap.
 */

const TINY_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0IDQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmNWY1ZjAiLz48L3N2Zz4='
const FALLBACK_SRC = '/logo.svg'

const isDataUrl = (src: unknown): boolean =>
  typeof src === 'string' && src.startsWith('data:')

type SmartImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL' | 'quality' | 'src'> & {
  src: ImageProps['src']
  /** Use a darker placeholder suited for light-on-dark hero sections. */
  dark?: boolean
  /** Quality 1-100, defaults to 75. */
  quality?: ImageProps['quality']
}

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const cloudinaryLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!CLOUDINARY_CLOUD) return src
  if (src.includes('res.cloudinary.com')) return src
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_${quality ?? 'auto'},w_${width}/${cleanSrc}`
}

export default function SmartImage({
  dark = false,
  quality = 75,
  loader,
  src,
  ...rest
}: SmartImageProps) {
  const blurDataURL = useMemo(() => (dark ? TINY_BLUR : TINY_BLUR), [dark])
  const resolvedLoader = loader ?? (CLOUDINARY_CLOUD ? cloudinaryLoader : undefined)
  const safeSrc = isDataUrl(src) ? FALLBACK_SRC : src
  return (
    <Image
      src={safeSrc}
      placeholder="blur"
      blurDataURL={blurDataURL}
      quality={quality}
      loader={resolvedLoader}
      {...rest}
    />
  )
}
