"use client";
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email?: string;
  subscription_status?: string;
  points?: number;
  co2_saved_kg?: number;
}
import { supabase } from '../../lib/supabaseClient';

// Debug: Show Supabase env variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default function LogActivity() {
  const [user, setUser] = useState<User | null>(null);
  const [type, setType] = useState<'walk' | 'cycle'>('walk');
  const [distance, setDistance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Check if user is logged in
  // Debug state for getUser result
  // Removed debugGetUser and forceUpdate for lint/type safety

  useEffect(() => {
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      setMessage('Login check is taking too long. Possible network or Supabase config issue.');
    }, 5000);

    const checkUser = async () => {
      try {
        const getUserResult = await supabase.auth.getUser();
  // debugGetUser removed
        const { data: { user }, error } = getUserResult;
        if (didTimeout) return;
        clearTimeout(timeout);
        if (error || !user) {
          setMessage(`Not logged in. Supabase error: ${error ? error.message : 'No user'} | user: ${JSON.stringify(user)}`);
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        // Check if user row exists in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (userError && userError.code !== 'PGRST116') {
          setMessage(`DB error: ${userError.message}`);
          return;
        }

        if (!userData) {
          // User row missing, create it
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              subscription_status: 'freemium',
              points: 0,
              co2_saved_kg: 0
            });
          if (insertError) {
            setMessage(`Failed to create user: ${insertError.message}`);
            return;
          }
        }

  setUser(user as User);
  // forceUpdate removed
      } catch (err) {
        setMessage('Unexpected error: ' + (err instanceof Error ? err.message : JSON.stringify(err)));
      }
    };
    checkUser();
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) {
      setMessage('Please enter a valid distance');
      return;
    }

    if (!user) {
      setMessage('User not loaded. Please try again.');
      return;
    }

    const dist = parseFloat(distance);
    const co2Saved = dist * 0.4; // 0.4kg per mile
    const pointsEarned = 1;

    setLoading(true);
    setMessage('');

    try {
      // Insert activity
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          type,
          distance_miles: dist,
          co2_saved_kg: co2Saved,
          gps_data: null // Optional: add GPS later
        });

      if (activityError) throw activityError;

      // Update user's points and CO2 saved
      const { error: userError } = await supabase.rpc('increment_user_stats', {
        user_id: user.id,
        points_inc: pointsEarned,
        co2_inc: co2Saved
      });

      if (userError) throw userError;

      setMessage(`✅ ${type === 'walk' ? 'Walk' : 'Cycle'} logged! +1 point • ${co2Saved.toFixed(1)}kg CO2 saved`);
      setDistance('');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Always show message if present
  if (message) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div>
          <p>{message}</p>
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
            <div><b>Supabase URL:</b> {supabaseUrl}</div>
            <div><b>Supabase Anon Key:</b> {supabaseAnonKey.slice(0, 8)}...{supabaseAnonKey.slice(-6)}</div>
            {/* debugGetUser removed */}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div>
          <p>Checking login...</p>
          <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
            <div><b>Supabase URL:</b> {supabaseUrl}</div>
            <div><b>Supabase Anon Key:</b> {supabaseAnonKey.slice(0, 8)}...{supabaseAnonKey.slice(-6)}</div>
            {/* debugGetUser removed */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6 text-center">MYCO2.app</h1>
        <p className="text-center mb-8 text-gray-300">
          Log your eco-action. Earn points. Save the planet.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Type */}
          <div className="flex mb-4 border-4 border-black rounded">
            <button
              type="button"
              onClick={() => setType('walk')}
              className={`flex-1 py-3 font-bold ${type === 'walk' ? 'bg-white text-black' : 'bg-black text-white'}`}
            >
              WALK
            </button>
            <button
              type="button"
              onClick={() => setType('cycle')}
              className={`flex-1 py-3 font-bold ${type === 'cycle' ? 'bg-white text-black' : 'bg-black text-white'}`}
            >
              CYCLE
            </button>
          </div>

          {/* Distance */}
          <input
            type="number"
            step="0.1"
            placeholder="Distance in miles"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full p-3 mb-4 border-4 border-black rounded bg-white text-black font-bold"
            required
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded border-4 border-black transition"
          >
            {loading ? 'LOGGING...' : 'LOG ACTIVITY'}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="mt-6 text-center text-sm font-bold border-2 border-white p-2 rounded">
            {message}
          </p>
        )}

        {/* Back */}
        <a
          href="/dashboard"
          className="block mt-4 text-center text-gray-400 hover:text-white text-sm"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
