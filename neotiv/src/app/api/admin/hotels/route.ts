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

    const body = await request.json();
    const { name, slug, location, timezone, adminEmail, adminPassword } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Insert hotel
    const { data: hotel, error: hotelErr } = await adminSupabase.from('hotels').insert({
      name,
      slug,
      location,
      timezone: timezone || 'UTC',
      is_active: true
    }).select().single();

    if (hotelErr) {
      return NextResponse.json({ error: hotelErr.message }, { status: 400 });
    }

    // 2. Fetch preset services
    const { data: presets } = await adminSupabase.from('service_icon_presets').select('*').eq('is_active', true);
    
    // 3. Seed default services
    if (presets && presets.length > 0) {
      const defaultsToSeed = presets.slice(0, 5).map(p => ({
        hotel_id: hotel.id,
        name: p.label,
        icon: p.emoji,
        sort_order: p.sort_order,
        is_active: true
      }));
      await adminSupabase.from('services').insert(defaultsToSeed);
    }
    
    // 4. Optionally create a Manager Account immediately
    if (adminEmail && adminPassword) {
      const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: 'manager', hotel_id: hotel.id, name: 'General Manager' }
      });
      
      if (!authError && newUser.user) {
        await adminSupabase.from('staff').insert({
          hotel_id: hotel.id,
          user_id: newUser.user.id,
          role: 'manager',
          name: 'General Manager',
          email: adminEmail,
          is_active: true
        });
      }
    }

    // 5. Activity Log
    await adminSupabase.from('activity_log').insert({
      actor_id: user.id,
      actor_email: user.email,
      action: 'hotel.created',
      target_type: 'hotel',
      target_id: hotel.id,
      meta: { hotelName: name, slug }
    });

    return NextResponse.json({ success: true, hotel });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
