import { prisma } from '@/lib/prisma'

export async function logAdminAction(adminId: string, action: string, target?: string, meta?: Record<string, any>) {
  try {
    await prisma.adminAudit.create({
      data: {
        adminId,
        action,
        target: target ?? null,
        meta: meta ?? undefined,
      },
    })
  } catch (error) {
    console.error('Audit log failed', error)
  }
}
