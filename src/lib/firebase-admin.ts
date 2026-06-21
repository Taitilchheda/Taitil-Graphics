// Server-side Firebase Admin SDK initialisation.
//
// Used to verify the ID tokens the browser obtains from Firebase Auth
// email-link sign-in. The browser POSTs those tokens to
// /api/auth/firebase/session, where this module confirms they were
// minted by our Firebase project before we issue our own HS256 JWT.
//
// The admin SDK needs a service account credential, which the user
// downloads from Firebase Console → Project Settings → Service Accounts
// → Generate New Private Key. We expect the JSON content of that file
// to be base64-encoded and stored in FIREBASE_SERVICE_ACCOUNT_JSON_B64.
// We never want that secret in source control — the user pastes the
// base64 string into the Vercel env-var UI, not into chat.

import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

const decodeServiceAccount = (): Record<string, unknown> => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON_B64 is not set. Download the service ' +
        'account key from Firebase Console → Project Settings → Service ' +
        'Accounts, base64-encode the JSON, and set it in the environment.',
    )
  }
  let decoded: string
  try {
    decoded = Buffer.from(raw, 'base64').toString('utf8')
  } catch (error) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON_B64 is not valid base64.')
  }
  try {
    return JSON.parse(decoded) as Record<string, unknown>
  } catch (error) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON_B64 did not decode to a JSON object. ' +
        'Make sure the entire service-account JSON file was base64-encoded.',
    )
  }
}

let cachedApp: App | null = null
let cachedAuth: Auth | null = null

export const getFirebaseAdminAuth = (): Auth => {
  if (cachedAuth) return cachedAuth
  const credential = decodeServiceAccount()
  cachedApp = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert(credential as Parameters<typeof cert>[0]),
      })
  cachedAuth = getAuth(cachedApp)
  return cachedAuth
}
