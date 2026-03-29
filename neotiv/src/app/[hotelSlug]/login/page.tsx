'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface LoginPageProps {
  params: Promise<{ hotelSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default function StaffLoginPage({ params, searchParams }: LoginPageProps): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hotelSlug, setHotelSlug] = useState('');

  // Resolve params on mount
  useState(() => {
    params.then((p) => setHotelSlug(p.hotelSlug));
    searchParams.then((sp) => {
      if (sp.error === 'unauthorized') setError('You do not have access to this panel.');
    });
  });

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError(authError?.message ?? 'Login failed. Please try again.');
      setLoading(false);
      return;
    }

    const role = data.user.user_metadata?.role as string;
    if (role === 'superadmin') {
      router.push('/admin');
    } else if (role === 'manager') {
      router.push(`/${hotelSlug}`);
    } else if (role === 'frontoffice') {
      router.push(`/${hotelSlug}/frontoffice`);
    } else {
      setError('Your account does not have a valid role. Please contact your administrator.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <span className="text-white text-2xl font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Neotiv
            </span>
          </div>
          <h1 className="text-white text-xl font-medium mb-1">Staff Login</h1>
          <p className="text-slate-400 text-sm">Sign in to your hotel management panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hotel.com"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
