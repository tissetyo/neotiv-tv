import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request, context: { params: Promise<{ hotelSlug: string }> }) {
  try {
    const { hotelSlug } = await context.params;
    const supabase = await createSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (user.user_metadata?.role !== 'manager' && user.user_metadata?.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: hotel } = await supabase.from('hotels').select('id').eq('slug', hotelSlug).single();
    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });

    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: { role, hotel_id: hotel.id, name }
    });

    if (inviteError) {
      if (inviteError.message.includes('already registered')) {
         return NextResponse.json({ error: 'User is already registered.' }, { status: 400 });
      }
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    if (inviteData.user) {
      const { error: staffError } = await adminSupabase.from('staff').insert({
        hotel_id: hotel.id,
        user_id: inviteData.user.id,
        role,
        name,
        email,
        is_active: true
      });
      if (staffError) {
        return NextResponse.json({ error: staffError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, user: inviteData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
