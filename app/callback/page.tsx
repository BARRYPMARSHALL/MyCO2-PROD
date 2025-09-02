// This page handles the OAuth callback from Supabase
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    // After OAuth, Supabase will handle the session automatically
    // You can add logic here if you want to fetch user profile or redirect
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Redirect to home or dashboard
        router.replace('/');
      } else {
        // Not logged in, redirect to login
        router.replace('/');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div>
        <h2 className="text-2xl font-bold mb-4">Signing you in...</h2>
        <p>If you are not redirected, please go back to the home page.</p>
      </div>
    </div>
  );
}