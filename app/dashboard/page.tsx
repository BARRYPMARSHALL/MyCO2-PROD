
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface Activity {
  id: string;
  type: string;
  distance_miles: number;
  co2_saved_kg: number;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [co2Saved, setCo2Saved] = useState<number>(0);
  const [rank, setRank] = useState<number>(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setMessage('');

      // Get authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        setMessage(`Auth error: ${authError.message}`);
        setLoading(false);
        return;
      }
      if (!authUser) {
        setMessage('Not logged in');
        setLoading(false);
        return;
      }

      setUser(authUser);

      // Try to load user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('points, co2_saved_kg')
        .eq('id', authUser.id)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        setMessage(`DB error: ${userError.message}`);
        setLoading(false);
        return;
      }

      if (userData) {
        setPoints(userData.points || 0);
        setCo2Saved(userData.co2_saved_kg || 0);
      } else {
        // User NOT in public.users — try to fix it
        setMessage('User not found in database. Creating...');
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            subscription_status: 'freemium',
            points: 0,
            co2_saved_kg: 0
          });

        if (insertError) {
          setMessage(`Failed to create user: ${insertError.message}`);
        } else {
          setMessage('User created! Refreshing...');
          setPoints(0);
          setCo2Saved(0);
          setTimeout(() => window.location.reload(), 1500);
          setLoading(false);
          return;
        }
      }

      // Load activities
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (activityError) {
        console.error(activityError);
      } else {
        setActivities(activityData || []);
      }

      // Mock rank
      setRank(Math.floor(Math.random() * 1000));

      setLoading(false);
    };
    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  if (message && message.startsWith('Auth error')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Not signed in</h2>
          <p>Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6 text-center">MYCO2.app</h1>
        <p className="text-center mb-8 text-gray-300">
          Your impact. Your progress.
        </p>

        {/* Points & CO2 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-red-600 border-4 border-black p-4 rounded">
            <h3 className="text-lg font-bold">Points</h3>
            <p className="text-2xl font-bold">{points}</p>
          </div>
          <div className="bg-green-600 border-4 border-black p-4 rounded">
            <h3 className="text-lg font-bold">CO2 Saved</h3>
            <p className="text-2xl font-bold">{co2Saved.toFixed(1)}kg</p>
          </div>
        </div>

        {/* Rank */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">Rank</h3>
          <p className="text-xl font-bold">{rank}th in the world</p>
        </div>

        {/* Activities */}
        <h3 className="text-lg font-bold mb-4">Your Activity</h3>
        <div className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="border-2 border-black p-2 bg-gray-900 rounded">
              <p>{activity.type.toUpperCase()} • {activity.distance_miles.toFixed(1)} miles • {activity.co2_saved_kg.toFixed(1)}kg CO2 saved</p>
            </div>
          ))}
        </div>

        {/* Log Activity Button */}
        <a
          href="/log"
          className="block w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded border-4 border-black transition text-center"
        >
          + LOG WALK/CYCLE
        </a>

        {/* Logout Button */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          className="w-full mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded border-4 border-black transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}