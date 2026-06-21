// Browser-side Firebase Auth SDK initialisation.
//
// Web SDK configs are designed to be public — Firebase secures them via
// App Check + Security Rules, not by hiding the key. The values below
// are the same ones the user pasted in chat; they live in NEXT_PUBLIC_*
// env vars so they ship to the browser. The SECRET is the service
// account key, which the server reads from FIREBASE_SERVICE_ACCOUNT_JSON_B64
// (see lib/firebase-admin.ts). Never put that secret in NEXT_PUBLIC_*.

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// We initialise lazily on first use so that builds that don't touch
// Firebase (e.g. /api routes at build time) don't fail when the env
// vars are unset. Calling `getFirebaseAuth()` from a component guarantees
// we're in the browser, which is the only place this module is used.
let cachedApp: FirebaseApp | null = null
let cachedAuth: Auth | null = null

const isBrowser = () => typeof window !== 'undefined'

const hasConfig = () =>
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !!firebaseConfig.appId

export const getFirebaseAuth = (): Auth => {
  if (!isBrowser()) {
    throw new Error('Firebase Auth is only available in the browser.')
  }
  if (!hasConfig()) {
    throw new Error(
      'Firebase web config is missing. Set NEXT_PUBLIC_FIREBASE_API_KEY, ' +
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, ' +
        'and NEXT_PUBLIC_FIREBASE_APP_ID in your environment.',
    )
  }
  if (cachedAuth) return cachedAuth
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>)
  cachedAuth = getAuth(cachedApp)
  return cachedAuth
}
