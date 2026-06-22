// Sign a Cloudinary direct-upload payload.
//
// This route does NOT receive the video file. The browser uploads the
// file directly to Cloudinary's API (https://api.cloudinary.com/...) after
// getting a signed payload from us. This is how we get around Vercel's
// 4.5 MB serverless function body limit — the file never reaches our
// server, so the limit doesn't apply.
//
// Flow:
//   1. Admin clicks "Upload video".
//   2. Browser POSTs to /api/admin/sign-video-upload (no body needed).
//   3. We verify admin auth, then sign a payload with cloud_name,
//      api_key, timestamp, and folder.
//   4. Browser POSTs the file + signature directly to Cloudinary.
//   5. Cloudinary returns the upload result; browser extracts the URL.
//
// We do NOT request an eager JPG poster at upload time. Cloudinary's
// `eager` param has caused two consecutive signature errors in this
// project (eager-as-string and eager-as-JSON-array both fail because
// Cloudinary expects a specific `/`-separated format for transformations
// on video uploads, and the format is finicky to sign correctly). The
// public product page derives a poster URL on the fly by transforming
// the video URL (see src/app/products/[id]/page.tsx) — that gives us
// the same result without the upload-time complication.
//
// Why signed? Without a signature, anyone with our cloud_name could
// upload to our Cloudinary account. The signature is a SHA-1 of the
// upload params signed with our API secret — the browser can't forge
// it without knowing the secret, which only lives on our server.
//
// Runtime: nodejs (the SDK lives in the Node runtime).

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { requireAdmin } from '@/lib/server-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const hasCloudinaryEnv = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  )

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export async function POST(_request: NextRequest) {
  const auth = await requireAdmin(_request)
  if (auth instanceof NextResponse) return auth

  if (!hasCloudinaryEnv()) {
    return NextResponse.json(
      {
        error:
          'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      },
      { status: 500 },
    )
  }

  configureCloudinary()

  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = {
    folder: 'taitil-products/videos',
    timestamp,
  }

  // cloudinary.utils.api_sign_request returns the hex SHA-1 signature.
  // The browser will POST: file=<file>&api_key=<key>&timestamp=<ts>&
  // folder=<folder>&signature=<sig> to Cloudinary.
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!)

  return NextResponse.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder: paramsToSign.folder,
    signature,
    // Cloudinary's upload endpoint. We expose it as a full URL so the
    // browser doesn't have to construct it.
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
  })
}
