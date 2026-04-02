"use client";

import { useState } from "react";
import { PricingCard } from "@/components/pricing/pricing-card";
import { CheckoutForm } from "@/components/pricing/checkout-form";
import { PRICING_PLANS, type PlanName } from "@/lib/stripe/config";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelect = async (planName: PlanName) => {
    setIsLoading(true);
    setSelectedPlan(planName);

    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setSelectedPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Redirect to dashboard with success message
    window.location.href = '/dashboard?payment=success';
  };

  const handlePaymentCancel = () => {
    setSelectedPlan(null);
    setClientSecret(null);
  };

  if (selectedPlan && clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <CheckoutForm
          clientSecret={clientSecret}
          planName={PRICING_PLANS[selectedPlan].name}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start with our free features and upgrade when you need more advanced tax tools.
          All plans include our core tax calculation engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {Object.entries(PRICING_PLANS).map(([key, plan]) => (
          <PricingCard
            key={key}
            planName={plan.name}
            price={plan.price}
            features={plan.features}
            isPopular={key === 'PRO'}
            onSelect={() => handlePlanSelect(key as PlanName)}
            isLoading={isLoading && selectedPlan === key}
          />
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans come with a 7-day money-back guarantee. No setup fees.
        </p>
      </div>
    </div>
  );
}