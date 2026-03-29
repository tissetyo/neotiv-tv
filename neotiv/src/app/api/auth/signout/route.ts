import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const referer = request.headers.get('referer') ?? '/';
  const origin = new URL(request.url).origin;

  // Detect hotel slug from referer
  const match = referer.match(/https?:\/\/[^/]+\/([^/]+)\//);
  const slug = match?.[1];

  if (slug && slug !== 'admin' && slug !== 'api' && slug !== '_next') {
    return NextResponse.redirect(new URL(`/${slug}/login`, origin));
  }

  return NextResponse.redirect(new URL('/admin/login', origin));
}
