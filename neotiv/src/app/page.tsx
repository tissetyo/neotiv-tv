import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage(): Promise<never> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const role = user.user_metadata?.role as string;
  if (role === 'superadmin') {
    redirect('/admin');
  }

  const hotelId = user.user_metadata?.hotel_id as string;
  if (hotelId) {
    // Look up the hotel slug for this user
    const { data: hotel } = await supabase
      .from('hotels')
      .select('slug')
      .eq('id', hotelId)
      .single();

    if (hotel) {
      if (role === 'manager') redirect(`/${hotel.slug}`);
      if (role === 'frontoffice') redirect(`/${hotel.slug}/frontoffice`);
    }
  }

  redirect('/admin/login');
}
