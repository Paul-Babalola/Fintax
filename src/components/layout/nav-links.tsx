"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/tax", label: "Tax", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
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
    </>
  );
}
