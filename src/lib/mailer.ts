import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

const hasEmailConfig = () =>
  !!process.env.EMAIL_HOST && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS

const transporter = hasEmailConfig()
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null

export async function sendTransactionalEmail(
  to: string,
  type: string,
  subject: string,
  html: string,
  orderId?: string,
) {
  await prisma.emailEvent.create({
    data: {
      orderId: orderId ?? null,
      toEmail: to,
      type,
      status: 'PENDING',
    },
  })

  if (!transporter) {
    await prisma.emailEvent.updateMany({
      where: { orderId: orderId ?? null, toEmail: to, type, status: 'PENDING' },
      data: { status: 'SKIPPED', error: 'Email not configured' },
    })
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    })
    await prisma.emailEvent.updateMany({
      where: { orderId: orderId ?? null, toEmail: to, type, status: 'PENDING' },
      data: { status: 'SENT' },
    })
  } catch (error: any) {
    await prisma.emailEvent.updateMany({
      where: { orderId: orderId ?? null, toEmail: to, type, status: 'PENDING' },
      data: { status: 'FAILED', error: error?.message || 'Send failed' },
    })
  }
}

export const emailTemplates = {
  orderPlaced: (name: string, orderId: string) => ({
    subject: `Order placed ? ${orderId.slice(0, 8).toUpperCase()}`,
    html: `<p>Hi ${name},</p><p>Your order <strong>${orderId}</strong> has been placed. We will confirm payment shortly.</p>`,
  }),
  paymentConfirmed: (name: string, orderId: string) => ({
    subject: `Payment confirmed ? ${orderId.slice(0, 8).toUpperCase()}`,
    html: `<p>Hi ${name},</p><p>Your payment is confirmed for order <strong>${orderId}</strong>. We will begin processing.</p>`,
  }),
  shipped: (name: string, orderId: string) => ({
    subject: `Order shipped ? ${orderId.slice(0, 8).toUpperCase()}`,
    html: `<p>Hi ${name},</p><p>Your order <strong>${orderId}</strong> has been shipped.</p>`,
  }),
  delivered: (name: string, orderId: string) => ({
    subject: `Order delivered ? ${orderId.slice(0, 8).toUpperCase()}`,
    html: `<p>Hi ${name},</p><p>Your order <strong>${orderId}</strong> has been delivered. Thank you!</p>`,
  }),
  refundInitiated: (name: string, orderId: string) => ({
    subject: `Refund initiated ? ${orderId.slice(0, 8).toUpperCase()}`,
    html: `<p>Hi ${name},</p><p>Your refund for order <strong>${orderId}</strong> has been initiated.</p>`,
  }),
  refundCompleted: (name: string, orderId: string) => ({
    subject: `Refund completed ? ${orderId.slice(0, 8).toUpperCase()}`,
    html: `<p>Hi ${name},</p><p>Your refund for order <strong>${orderId}</strong> has been completed.</p>`,
  }),
}
