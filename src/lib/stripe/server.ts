import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    });
  }
  return stripeInstance;
}

export async function createStripeCustomer(email: string, userId: string) {
  const stripe = getStripe();
  return await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });
}

export async function createPaymentIntent(amount: number, customerId: string, planName: string) {
  const stripe = getStripe();
  return await stripe.paymentIntents.create({
    amount,
    currency: 'ngn',
    customer: customerId,
    metadata: {
      planName,
    },
    payment_method_types: ['card'],
  });
}

export async function createSubscription(customerId: string, priceId: string) {
  const stripe = getStripe();
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function retrieveSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return await stripe.subscriptions.retrieve(subscriptionId);
}