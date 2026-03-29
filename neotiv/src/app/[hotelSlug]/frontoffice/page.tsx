import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ hotelSlug: string }>;
}

export default async function FrontOfficePage({ params }: Props): Promise<never> {
  const { hotelSlug } = await params;
  redirect(`/${hotelSlug}/frontoffice/rooms`);
}
