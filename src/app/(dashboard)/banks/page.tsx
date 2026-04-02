import { BankConnections } from "@/components/bank/bank-connections";

export default function BanksPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Bank Connections</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Connect your bank accounts to automatically sync transactions.
        </p>
      </div>

      <BankConnections />
    </div>
  );
}