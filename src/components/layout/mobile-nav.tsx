"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/tax", label: "Tax", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden">
        {/* Top bar */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 bg-background border-b sticky top-0 z-40">
          <span className="text-lg font-semibold tracking-tight">
            Fin<span className="text-[#1A6B4A]">tax</span>
          </span>
          <button
            onClick={() => setOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Overlay */}
        {open && (
          <div
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-background z-50 transform transition-transform duration-200 md:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 h-14 border-b">
            <span className="text-lg font-semibold tracking-tight">
              Fin<span className="text-[#1A6B4A]">tax</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-3 py-4 space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors ${
                    isActive
                      ? "bg-[#1A6B4A]/10 text-[#1A6B4A] font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t">
            <p className="text-xs text-muted-foreground truncate mb-2">
              {email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
