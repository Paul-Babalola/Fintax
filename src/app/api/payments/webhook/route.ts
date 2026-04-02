import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
  });

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update payment status
        await supabase
          .from('payments')
          .update({ status: 'succeeded' })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        // Create or update subscription
        const userId = paymentIntent.metadata?.userId;
        const planName = paymentIntent.metadata?.planName;
        
        if (userId && planName) {
          const now = new Date();
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + 1);

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: paymentIntent.customer as string,
            plan_name: planName,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', failedPayment.id);
        break;

      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object;
        
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', canceledSubscription.id);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}