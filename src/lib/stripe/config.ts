import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const PRICING_PLANS = {
  BASIC: {
    name: 'Basic',
    price: 5000, // ₦50 in kobo
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: [
      'Income & expense tracking',
      'Basic tax estimates',
      'Monthly reports',
      'Email support'
    ] as string[]
  },
  PRO: {
    name: 'Pro',
    price: 15000, // ₦150 in kobo
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Everything in Basic',
      'Advanced tax optimization',
      'Receipt scanning with AI',
      'Bank sync integration',
      'Priority support',
      'Tax filing assistance'
    ] as string[]
  },
  PREMIUM: {
    name: 'Premium',
    price: 25000, // ₦250 in kobo
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Everything in Pro',
      'Dedicated tax advisor',
      'Custom tax strategies',
      'Audit protection',
      'Phone support',
      'Diaspora tax module'
    ] as string[]
  }
} as const;

export type PlanName = keyof typeof PRICING_PLANS;