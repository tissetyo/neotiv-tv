import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface HotelLayoutProps {
  children: React.ReactNode;
  params: Promise<{ hotelSlug: string }>;
}

export default async function HotelLayout({ children, params }: HotelLayoutProps) {
  const { hotelSlug } = await params;
  const supabase = await createClient();

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, name, is_active')
    .eq('slug', hotelSlug)
    .single();

  if (!hotel || !hotel.is_active) {
    notFound();
  }

  return <>{children}</>;
}
