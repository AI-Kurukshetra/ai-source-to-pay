import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  // Role-based guard for protected route groups.
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isSupplierRoute = pathname.startsWith("/supplier");

  if (!isAdminRoute && !isSupplierRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return redirectToLogin(request);
  }

  const { data: refreshedSession } = await supabase.auth.getSession();
  if (!refreshedSession.session?.user) {
    return redirectToLogin(request);
  }

  const role =
    (user.user_metadata?.role as "admin" | "supplier" | undefined) ??
    null;

  if (!role) {
    return redirectToLogin(request);
  }

  if (isAdminRoute && role !== "admin") {
    return redirectToLogin(request);
  }

  if (isSupplierRoute && role !== "supplier") {
    return redirectToLogin(request);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/supplier/:path*"],
};
