import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, context: { params: Promise<{ hotelSlug: string, staffId: string }> }) {
  try {
    const { staffId } = await context.params;
    const supabase = await createSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (user.user_metadata?.role !== 'manager' && user.user_metadata?.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { role, action, is_active } = body;
    
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: staffData } = await adminSupabase.from('staff').select('user_id').eq('id', staffId).single();
    if (!staffData) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

    if (action === 'revoke') {
        await adminSupabase.auth.admin.updateUserById(staffData.user_id, { ban_duration: is_active ? 'none' : '876000h' });
        await adminSupabase.from('staff').update({ is_active }).eq('id', staffId);
    } else if (role) {
        const { data: userData } = await adminSupabase.auth.admin.getUserById(staffData.user_id);
        if (userData.user) {
          const newMetadata = { ...userData.user.user_metadata, role };
          await adminSupabase.auth.admin.updateUserById(staffData.user_id, { user_metadata: newMetadata });
        }
        await adminSupabase.from('staff').update({ role }).eq('id', staffId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
