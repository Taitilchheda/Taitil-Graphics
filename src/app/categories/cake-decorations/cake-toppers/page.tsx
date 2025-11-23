"use client"

import { useEffect } from 'react'
import { redirect } from 'next/navigation'

export default function CakeToppersRedirect() {
  // Redirect the old "cake-toppers" slug to the cake decorations landing so users can pick paper vs acrylic
  useEffect(() => {
    redirect('/categories/cake-decorations')
  }, [])

  return null
}
