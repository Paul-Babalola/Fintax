import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/sign-out-button";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Overview",  icon: LayoutDashboard },
  { href: "/income",     label: "Income",    icon: TrendingUp       },
  { href: "/expenses",   label: "Expenses",  icon: Receipt          },
  { href: "/budget",     label: "Budget",    icon: Wallet           },
  { href: "/tax",        label: "Tax",       icon: FileText         },
  { href: "/settings",  label: "Settings",  icon: Settings         },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Belt-and-suspenders guard — middleware should catch this first
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 bg-background border-r shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b">
          <span className="text-lg font-semibold tracking-tight">
            Fin<span className="text-[#1A6B4A]">tax</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="px-4 py-4 border-t">
          <p className="text-xs text-muted-foreground truncate mb-2">
            {user.email}
          </p>
          <SignOutButton />
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 bg-background border-b">
          <span className="text-lg font-semibold tracking-tight">
            Fin<span className="text-[#1A6B4A]">tax</span>
          </span>
          {/* Mobile nav omitted for MVP — add a Sheet drawer in Phase 2 */}
          <SignOutButton />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
