import { createClient } from '@/lib/supabase/server';
import AccountsClient from './accounts-client';

export default async function AdminAccountsPage() {
  const supabase = await createClient();
  
  const { data: staff } = await supabase
    .from('staff')
    .select('*, hotels(name, slug)')
    .order('created_at', { ascending: false });

  const { data: hotels } = await supabase
    .from('hotels')
    .select('id, name')
    .order('name', { ascending: true });

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
           <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Global Accounts</h1>
           <p style={{ color: '#64748b' }}>Manage all managers and front-office users</p>
        </div>
      </div>
      <AccountsClient initialStaff={staff || []} hotels={hotels || []} />
    </div>
  );
}
