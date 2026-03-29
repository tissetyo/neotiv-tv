import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Extract hotelSlug from pathname
  const hotelSlugMatch = pathname.match(/^\/([^/]+)/);
  const hotelSlug = hotelSlugMatch ? hotelSlugMatch[1] : null;

  // Public paths — always allow
  const isPublicPath =
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/room/login') ||
    pathname.startsWith('/api/weather') ||
    pathname.startsWith('/api/flights') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/manifest.json' ||
    (hotelSlug && pathname === `/${hotelSlug}/login`) ||
    (hotelSlug && pathname.startsWith(`/${hotelSlug}/dashboard`));

  if (isPublicPath) return supabaseResponse;

  // /admin/* routes — require superadmin
  if (pathname.startsWith('/admin')) {
    if (!user || user.user_metadata?.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return supabaseResponse;
  }

  // /[hotelSlug]/frontoffice/* — require frontoffice or manager
  if (hotelSlug && pathname.includes('/frontoffice')) {
    if (!user) {
      return NextResponse.redirect(new URL(`/${hotelSlug}/login`, request.url));
    }
    const role = user.user_metadata?.role as string;
    if (role !== 'frontoffice' && role !== 'manager') {
      return NextResponse.redirect(new URL(`/${hotelSlug}/login?error=unauthorized`, request.url));
    }
    return supabaseResponse;
  }

  // /[hotelSlug]/* (management) — require manager
  if (hotelSlug && hotelSlug !== 'admin' && hotelSlug !== 'api') {
    if (!user) {
      return NextResponse.redirect(new URL(`/${hotelSlug}/login`, request.url));
    }
    const role = user.user_metadata?.role as string;
    if (role !== 'manager' && role !== 'superadmin') {
      return NextResponse.redirect(new URL(`/${hotelSlug}/login?error=unauthorized`, request.url));
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
