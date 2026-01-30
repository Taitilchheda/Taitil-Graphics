import Razorpay from 'razorpay'

const keyId = process.env.RAZORPAY_KEY_ID
const keySecret = process.env.RAZORPAY_KEY_SECRET

const client = keyId && keySecret
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null

export const getRazorpay = () => {
  if (!client) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set')
  }
  return client
}
