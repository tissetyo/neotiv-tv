import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabaseSession = await createSupabaseClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user || user.user_metadata?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) {
       return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Optional: Send this link via your own MTA or let Supabase automatically handle the dispatch depending on Supabase Dashboard templates configuration.
    // For this build, we just assume it's logged or sent.

    await adminSupabase.from('activity_log').insert({
      actor_id: user.id,
      actor_email: user.email,
      action: 'staff.password_reset',
      target_type: 'staff_email',
      meta: { target_email: email }
    });

    return NextResponse.json({ success: true, link: data.properties?.action_link });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
