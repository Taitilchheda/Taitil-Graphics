// Admin-only video upload endpoint.
//
// Flow:
//   1. Admin submits the form (multipart/form-data with one `file` field).
//   2. We parse the file via the Web `Request.formData()` API.
//   3. We validate type (mp4/mov/webm) and size (≤ 30 MB).
//   4. We stream the buffer to Cloudinary via `uploader.upload_stream`,
//      asking for an eager JPG transformation as the poster frame.
//   5. We return `{ url, poster }` so the admin form can stash the URL
//      in `Product.media.videoUrl`.
//
// Why streaming instead of buffering? A 30 MB Buffer in the Node runtime
// is fine, but the SDK's `uploader.upload` would first fully read the
// file into a base64 string (~40 MB) before sending. `upload_stream`
// pipes a Readable directly, halving peak memory.
//
// Runtime: `nodejs`. The Cloudinary SDK uses Node-only APIs (http,
// stream) and is not edge-compatible.

import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'node:stream'
import { v2 as cloudinary } from 'cloudinary'
import { requireAdmin } from '@/lib/server-auth'

export const runtime = 'nodejs'
// Never cache uploads — Cloudinary config or env may change between
// requests, and we don't want a CDN edge to hold onto an error.
export const dynamic = 'force-dynamic'

const MAX_BYTES = 30 * 1024 * 1024 // 30 MB — well above the 10 MB videos you mentioned
const ALLOWED_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm'])
// Some browsers (and QuickTime) report MOV as empty/odd MIME; we fall
// back to extension sniffing for those.
const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v']

const hasCloudinaryEnv = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  )

// Lazy config — we don't want to configure the SDK at module load time
// because that crashes in local dev when env vars aren't set.
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

const extensionOf = (filename: string): string => {
  const idx = filename.lastIndexOf('.')
  return idx === -1 ? '' : filename.slice(idx + 1).toLowerCase()
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
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

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (err) {
    console.error('upload-video: failed to parse formData', err)
    return NextResponse.json({ error: 'Invalid multipart payload.' }, { status: 400 })
  }

  const fileEntry = formData.get('file')
  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
  }

  if (fileEntry.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Video too large. Max ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    )
  }

  const mime = fileEntry.type.toLowerCase()
  const ext = extensionOf(fileEntry.name)
  const mimeOk = ALLOWED_TYPES.has(mime)
  const extOk = ALLOWED_EXTENSIONS.includes(ext)
  // Allow when either signal says yes — Safari on iOS sometimes sends
  // mp4 with an empty MIME, and QuickTime .mov files report
  // `video/quicktime` only on macOS.
  if (!mimeOk && !extOk) {
    return NextResponse.json(
      { error: 'Unsupported video type. Use MP4, MOV, or WebM.' },
      { status: 415 },
    )
  }

  configureCloudinary()

  // Cloudinary's `upload_stream` accepts a Node Readable and returns
  // a Promise. We adapt the Web File's underlying stream into a Node
  // Readable so we don't double-buffer the file into memory.
  const nodeStream = Readable.fromWeb(fileEntry.stream() as any)

  const folder = 'taitil-products/videos'
  // Cloudinary public_id — uses a random component since folder+name
  // collisions would 409 on duplicate upload.
  const publicId = `taitil-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`

  try {
    const result: any = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder,
          public_id: publicId,
          // Eager transformation runs synchronously here so we can
          // return the poster URL in the same response. Cloudinary
          // generates a JPG poster at the first frame, cropped to
          // 800x800 fill — same aspect ratio we use for product
          // images.
          eager: [
            {
              format: 'jpg',
              transformation: [{ width: 800, height: 800, crop: 'fill', gravity: 'auto' }],
            },
          ],
          eager_async: false,
        },
        (error, uploadResult) => {
          if (error) reject(error)
          else resolve(uploadResult)
        },
      )
      nodeStream.pipe(upload)
    })

    const url = result.secure_url as string
    const eager = Array.isArray(result.eager) ? result.eager : []
    const poster = (eager[0]?.secure_url as string | undefined) ?? null

    return NextResponse.json({ url, poster })
  } catch (err) {
    console.error('upload-video: Cloudinary upload failed', err)
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
