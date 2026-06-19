import { NextResponse } from 'next/server'

type CacheParams = {
  seconds?: number
}

export const jsonWithCache = (data: any, { seconds = 60 }: CacheParams = {}) => {
  const response = NextResponse.json(data)
  response.headers.set('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 5}`)
  return response
}
