import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPaymentIntent, createStripeCustomer } from '@/lib/stripe/server';
import { PRICING_PLANS, type PlanName } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const { planName }: { planName: PlanName } = await request.json();
    
    if (!planName || !PRICING_PLANS[planName]) {
      return NextResponse.json({ error: 'Invalid plan name' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createStripeCustomer(user.email!, user.id);
      customerId = customer.id;
    }

    const plan = PRICING_PLANS[planName];
    const paymentIntent = await createPaymentIntent(plan.price, customerId, planName);

    // Store payment intent in database
    await supabase.from('payments').insert({
      user_id: user.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: plan.price,
      currency: 'ngn',
      status: paymentIntent.status,
      plan_name: planName,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}