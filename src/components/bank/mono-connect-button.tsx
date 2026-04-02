"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Landmark, Loader2 } from "lucide-react";

interface MonoConnectButtonProps {
  onSuccess?: () => void;
}

export function MonoConnectButton({ onSuccess }: MonoConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      // In a real implementation, you'd load the Mono Connect widget
      // For now, we'll simulate the flow
      
      // This would normally open the Mono Connect widget
      const simulatedCode = `mock_auth_code_${Date.now()}`;
      
      // Exchange code for account connection
      const response = await fetch('/api/bank/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: simulatedCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect bank account');
      }

      const result = await response.json();
      
      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error connecting bank account:', error);
      alert('Failed to connect bank account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-[#1A6B4A] hover:bg-[#145a3d]"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Landmark className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Connecting...' : 'Connect Bank Account'}
    </Button>
  );
}

// Real Mono Connect implementation would look like this:
/*
export function MonoConnectButton({ onSuccess }: MonoConnectButtonProps) {
  useEffect(() => {
    // Load Mono Connect script
    const script = document.createElement('script');
    script.src = 'https://connect.mono.co/connect.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleConnect = () => {
    const monoConnect = new (window as any).MonoConnect({
      publicKey: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY,
      onSuccess: (data: any) => {
        fetch('/api/bank/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: data.code }),
        }).then(() => onSuccess?.());
      },
      onError: (error: any) => {
        console.error('Mono Connect error:', error);
      },
    });

    monoConnect.open();
  };

  return <Button onClick={handleConnect}>Connect Bank Account</Button>;
}
*/