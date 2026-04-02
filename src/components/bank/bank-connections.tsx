"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MonoConnectButton } from "./mono-connect-button";
import { Landmark, RefreshCw, Trash2, Clock } from "lucide-react";

interface BankConnection {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  account_type: string;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
}

export function BankConnections() {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/bank/connections');
      const { connections } = await response.json();
      setConnections(connections || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncingId(connectionId);
    
    try {
      const response = await fetch('/api/bank/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const result = await response.json();
      alert(result.message);
      
      // Update last sync time
      fetchConnections();
    } catch (error) {
      console.error('Error syncing transactions:', error);
      alert('Failed to sync transactions. Please try again.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this bank account?')) {
      return;
    }

    try {
      const response = await fetch('/api/bank/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      fetchConnections();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      alert('Failed to disconnect account. Please try again.');
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading bank connections...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Bank Connections
            </div>
            <MonoConnectButton onSuccess={fetchConnections} />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your bank accounts to automatically import transactions and simplify tax tracking.
          </p>
        </CardHeader>
      </Card>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Landmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No bank accounts connected</h3>
            <p className="text-muted-foreground mb-6">
              Connect your bank account to automatically sync transactions and save time on manual entry.
            </p>
            <MonoConnectButton onSuccess={fetchConnections} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{connection.bank_name}</h3>
                      <Badge 
                        variant={connection.is_active ? "default" : "secondary"}
                        className={connection.is_active ? "bg-[#1A6B4A]" : ""}
                      >
                        {connection.is_active ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {connection.account_name} • {connection.account_number} • {connection.account_type}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last synced: {formatLastSync(connection.last_sync)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(connection.id)}
                      disabled={!connection.is_active || syncingId === connection.id}
                    >
                      {syncingId === connection.id ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}