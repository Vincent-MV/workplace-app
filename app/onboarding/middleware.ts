import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Try to get session, but handle errors gracefully
  let session = null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Middleware getSession error:", error);
      session = null;
    } else {
      session = data.session;
    }
  } catch (err) {
    console.error("Middleware auth error:", err);
    session = null;
  }

  // ✅ NEW: If we have a session but it's invalid, clear cookies
  if (session) {
    try {
      const { error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.warn("Invalid session - clearing cookies");
        session = null;
        // Clear all Supabase cookies
        supabaseResponse.cookies.delete("sb-token");
        supabaseResponse.cookies.delete("sb-refresh-token");
      }
    } catch (err) {
      session = null;
    }
  }

  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ["/", "/reset-password"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/auth/")
  );

  // Onboarding is special
  const isOnboarding = pathname === "/onboarding";

  // Protected routes (require auth)
  const protectedRoutes = [
    "/dashboard",
    "/tasks",
    "/meetings",
    "/habits",
    "/notes",
    "/lessons",
    "/ai-tools",
    "/podcasts",
    "/photos",
    "/location",
    "/storage",
    "/search",
  ];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If trying to access protected route WITHOUT session
  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If trying to access onboarding WITHOUT session
  if (isOnboarding && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to access public route
  if (isPublicRoute && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to access onboarding
  if (isOnboarding && session) {
    const { data: workspaces } = await supabase
      .from("workspaces")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("is_active", true)
      .limit(1);

    if (workspaces && workspaces.length > 0) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
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