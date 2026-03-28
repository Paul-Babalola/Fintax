import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fintax — Sign in",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-semibold text-foreground tracking-tight">
            Fin<span className="text-[#1A6B4A]">tax</span>
          </span>
          <p className="text-sm text-muted-foreground mt-1">
            Budget, Expense & Tax — Nigeria
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
