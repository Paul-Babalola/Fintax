import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove this line
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Unauthenticated user hitting a protected route ──
  if (!user && (pathname.startsWith("/dashboard") ||
                pathname.startsWith("/income") ||
                pathname.startsWith("/expenses") ||
                pathname.startsWith("/budget") ||
                pathname.startsWith("/tax") ||
                pathname.startsWith("/onboarding"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // ── Authenticated user hitting auth pages ──
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // ── Authenticated user hitting dashboard without completing onboarding ──
  // Skip this check for the onboarding page itself and the auth callback
  if (user &&
      pathname.startsWith("/dashboard") &&
      pathname !== "/onboarding") {

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single();

    if (profile && !profile.onboarding_complete) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
