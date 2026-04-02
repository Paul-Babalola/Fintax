"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CreditCard } from "lucide-react";

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  current_period_end: string;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const { subscription } = await response.json();
      setSubscription(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await fetch('/api/subscription', { method: 'DELETE' });
      setSubscription(null);
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading subscription...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Free Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You're currently on the free plan. Upgrade to unlock premium features.
          </p>
          <Button asChild className="bg-[#1A6B4A] hover:bg-[#145a3d]">
            <a href="/pricing">Upgrade Now</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {subscription.plan_name} Plan
          </div>
          <Badge 
            variant={subscription.status === 'active' ? 'default' : 'secondary'}
            className={subscription.status === 'active' ? 'bg-[#1A6B4A]' : ''}
          >
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <CalendarDays className="h-4 w-4" />
          Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
        </div>
        
        {subscription.status === 'active' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/pricing">Change Plan</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}