import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, context: { params: Promise<{ hotelId: string }> }) {
  try {
    const { hotelId } = await context.params;
    const supabaseSession = await createSupabaseClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user || user.user_metadata?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { is_active } = await request.json();

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await adminSupabase.from('hotels').update({ is_active }).eq('id', hotelId);

    const { data: staff } = await adminSupabase.from('staff').select('user_id').eq('hotel_id', hotelId);
    
    if (staff && staff.length > 0) {
       for (const s of staff) {
          await adminSupabase.auth.admin.updateUserById(s.user_id, {
             ban_duration: is_active ? 'none' : '876000h'
          });
       }
    }

    await adminSupabase.from('activity_log').insert({
      actor_id: user.id,
      actor_email: user.email,
      action: is_active ? 'hotel.reactivated' : 'hotel.deactivated',
      target_type: 'hotel',
      target_id: hotelId
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
