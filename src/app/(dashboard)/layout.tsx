import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { NavLinks } from "@/components/layout/nav-links";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 bg-background border-r shrink-0">
        <div className="h-14 flex items-center px-5 border-b">
          <span className="text-lg font-semibold tracking-tight">
            Fin<span className="text-[#1A6B4A]">tax</span>
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLinks />
        </nav>
        <div className="px-4 py-4 border-t">
          <p className="text-xs text-muted-foreground truncate mb-2">
            {user.email}
          </p>
          <SignOutButton />
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile nav — hidden on desktop */}
        <div className="md:hidden">
          <MobileNav email={user.email ?? ""} />
        </div>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
