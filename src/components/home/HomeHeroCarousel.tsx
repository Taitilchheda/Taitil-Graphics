'use client'

import { useEffect, useState } from 'react'
import Image, { type ImageProps } from 'next/image'

type Props = {
  images: string[]
  primarySizes?: ImageProps['sizes']
  secondarySizes?: ImageProps['sizes']
}

/**
 * Client island for the homepage hero carousel. Everything else on the
 * home page is server-rendered, but the auto-advance timer + analytics
 * need a small client bundle. Kept narrow on purpose: <5 KB of JS.
 */
export default function HomeHeroCarousel({ images, primarySizes, secondarySizes }: Props) {
  const [index, setIndex] = useState(0)
  const safeImages = images.length > 0
    ? images
    : ['/images/sweets box mockup 2.jpg']
  const count = safeImages.length
  const primary = safeImages[index % count]
  const secondary = safeImages[(index + 1) % count]
  const tertiary = safeImages[(index + 2) % count]

  useEffect(() => {
    if (count <= 1) return
    const timer = setInterval(() => setIndex((p) => (p + 1) % count), 5500)
    return () => clearInterval(timer)
  }, [count])

  return (
    <>
      <Image
        src={primary}
        alt="Premium packaging and print"
        width={640}
        height={440}
        priority
        sizes={primarySizes}
        className="rounded-xl object-contain w-full h-[300px] sm:h-[360px] md:h-[380px] bg-white transition-opacity duration-700 ease-in-out"
      />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Image
          src={secondary}
          alt="Cake topper sample"
          width={300}
          height={200}
          sizes={secondarySizes}
          className="rounded-lg object-contain w-full h-32 sm:h-36 bg-white transition-opacity duration-700 ease-in-out"
        />
        <Image
          src={tertiary}
          alt="Decor bundle"
          width={300}
          height={200}
          sizes={secondarySizes}
          className="rounded-lg object-contain w-full h-32 sm:h-36 bg-white transition-opacity duration-700 ease-in-out"
        />
      </div>
    </>
  )
}
