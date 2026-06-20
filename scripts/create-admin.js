// One-shot admin bootstrap. Idempotent: re-running resets the password
// and re-promotes the role to ADMIN, but does not overwrite the user's
// `name` once it has been set.
//
// Usage:
//   node --env-file-if-exists=.env scripts/create-admin.js
//
// After the first successful run, delete this file — it isn't a runtime
// dependency and shipping the default password in source is the whole
// thing this script exists to avoid.
//
// Requires `DATABASE_URL` to be set in the environment (loaded from .env
// by the `--env-file-if-exists` flag above). Runs against whichever
// MongoDB cluster that URL points at — be careful, there is no separate
// "production" guard. The script will print a warning if the URL looks
// like a remote (mongodb+srv://) cluster.

/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const ADMIN_EMAIL = 'admin@taitil.graphics'
const ADMIN_PASSWORD = 'Taitil@Admin2026'
const ADMIN_NAME = 'Taitil'
const BCRYPT_COST = 12

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      '[create-admin] DATABASE_URL is not set.\n' +
        'Run with: node --env-file-if-exists=.env scripts/create-admin.js',
    )
    process.exit(1)
  }

  const looksLikeProd =
    process.env.DATABASE_URL.startsWith('mongodb+srv://') ||
    /prod/i.test(process.env.DATABASE_URL)

  if (looksLikeProd) {
    console.warn(
      '[create-admin] DATABASE_URL looks like a remote/production cluster.',
    )
    console.warn('             Continuing in 3s — Ctrl-C to abort.')
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  const prisma = new PrismaClient()
  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_COST)
    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: passwordHash,
          role: 'ADMIN',
          // Don't touch `name` — preserve whatever the operator set.
        },
      })
      console.log(`[create-admin] Updated existing user ${ADMIN_EMAIL} to ADMIN.`)
    } else {
      await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          password: passwordHash,
          role: 'ADMIN',
        },
      })
      console.log(`[create-admin] Created new admin user ${ADMIN_EMAIL}.`)
    }

    console.log('')
    console.log(`  Email:    ${ADMIN_EMAIL}`)
    console.log(`  Password: ${ADMIN_PASSWORD}`)
    console.log('')
    console.log('  ⚠ Change the password from /account after first login.')
    console.log('  ⚠ Delete scripts/create-admin.js once it has run successfully.')
  } catch (error) {
    console.error('[create-admin] Failed:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()