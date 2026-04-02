"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  planName: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

export function PricingCard({ 
  planName, 
  price, 
  features, 
  isPopular, 
  onSelect,
  isLoading 
}: PricingCardProps) {
  return (
    <Card className={`relative ${isPopular ? 'border-[#1A6B4A] shadow-lg' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1A6B4A] text-white">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">{planName}</CardTitle>
        <div className="text-3xl font-bold">
          ₦{(price / 100).toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground">/month</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <Check className="h-4 w-4 text-[#1A6B4A] flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className={`w-full ${
            isPopular 
              ? 'bg-[#1A6B4A] hover:bg-[#145a3d]' 
              : 'bg-gray-900 hover:bg-gray-800'
          }`}
          onClick={onSelect}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  );
}