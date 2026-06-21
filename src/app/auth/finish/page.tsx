'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase-client'
import { useAuth } from '@/components/providers/AuthProvider'
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

// /auth/finish is where Firebase Auth drops the user after they click
// the magic link in their email. We:
//   1. Confirm the URL is actually a sign-in link (defense in depth —
//      someone could land here by typing the URL).
//   2. Read the email from localStorage (Firebase documents this —
//      the link only carries an oobCode, not the address).
//   3. Call signInWithEmailLink to mint a Firebase session + ID token.
//   4. POST the ID token to /api/auth/firebase/session, which verifies
//      it with firebase-admin and issues our own HS256 JWT.
//   5. Store that JWT in our AuthProvider and redirect.
//
// If the email is missing from localStorage (e.g. the user opened the
// link in a different browser/incognito window from where they started
// the sign-in) we show a clear message asking them to return to the
// login page and re-enter their email so we can re-send the link.

const EMAIL_STORAGE_KEY = 'emailForSignIn'

function FinishPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // setUser pushes the new session into context without a reload, so
  // the header/avatar/etc. flip to signed-in state immediately.
  const { setUser } = useAuth()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Completing sign-in…')

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      // Guard: only handle Firebase email-link redirects.
      if (typeof window === 'undefined') return
      const href = window.location.href
      if (!isSignInWithEmailLink(getFirebaseAuth(), href)) {
        if (cancelled) return
        setStatus('error')
        setMessage('This page only handles Firebase email sign-in links. Open the link from your email instead of typing the URL.')
        return
      }

      // Pull the email the user entered on the login page. If it's
      // missing, the user probably opened the link in a different
      // browser/incognito window — we can't complete sign-in without
      // the email, so we send them back.
      const email = window.localStorage.getItem(EMAIL_STORAGE_KEY)
      if (!email) {
        if (cancelled) return
        setStatus('error')
        setMessage(
          'We don\'t have the email you used to request the sign-in link. Please go back to the sign-in page and re-enter your email so we can send a fresh link.',
        )
        return
      }

      try {
        // 1. Complete the Firebase sign-in. This sets the browser-side
        //    Firebase auth state and gives us a UserCredential with an
        //    ID token we can send to our server.
        const result = await signInWithEmailLink(getFirebaseAuth(), email, href)
        if (cancelled) return
        const idToken = await result.user.getIdToken(true)
        // 2. Exchange the Firebase ID token for our own HS256 JWT.
        const response = await fetch('/api/auth/firebase/session', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, email }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          if (cancelled) return
          setStatus('error')
          setMessage(payload.error || 'Could not sign you in. The link may have expired — try requesting a new one.')
          return
        }
        const data = await response.json()
        // 3. Mirror the response into our AuthProvider + localStorage
        //    so the rest of the app (header, checkout, etc.) sees the
        //    session immediately. We don't reload the page because the
        //    Firebase auth state has changed in the browser context.
        const signedIn = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || data.user.email,
          role: data.user.role || 'customer',
          phone: data.user.phone,
          address: data.user.address,
          isBusiness: data.user.isBusiness,
          businessName: data.user.businessName,
          gstNumber: data.user.gstNumber,
          token: data.token,
        }
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(EMAIL_STORAGE_KEY)
        }
        setUser(signedIn)
        // 4. Redirect to the ?next= target (or /). We use replace
        //    so the user can't hit "back" and re-trigger the link
        //    (Firebase links are single-use anyway, but defence in depth).
        const next = searchParams.get('next') || (signedIn.role === 'admin' ? '/admin' : '/')
        const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
        if (cancelled) return
        setStatus('success')
        setMessage(`Welcome${signedIn.name ? `, ${signedIn.name}` : ''}. Redirecting…`)
        setTimeout(() => router.replace(safeNext), 600)
      } catch (err: any) {
        if (cancelled) return
        // Common cases: link expired, link already used, wrong email.
        const code: string = err?.code || ''
        const friendly =
          code === 'auth/invalid-action-code' || code === 'auth/expired-action-code'
            ? 'This sign-in link has expired or already been used. Please request a new one from the sign-in page.'
            : code === 'auth/email-already-in-use' || code === 'auth/credential-already-in-use'
              ? 'This email is already linked to another sign-in method. Try signing in with your password instead.'
              : err?.message || 'Could not complete sign-in. Please try again.'
        setStatus('error')
        setMessage(friendly)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card text-center space-y-4">
          {status === 'loading' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Completing sign-in</h1>
              <p className="text-sm text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Signed in</h1>
              <p className="text-sm text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Sign-in failed</h1>
              <p className="text-sm text-gray-600">{message}</p>
              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                >
                  <Mail className="h-4 w-4" /> Back to sign-in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FinishPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100" />}>
      <FinishPageContent />
    </Suspense>
  )
}
