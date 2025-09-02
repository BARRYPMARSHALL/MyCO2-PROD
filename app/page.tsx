"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Signed in successfully.");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    } else {
      setMessage("Signed out.");
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset email sent (if the email exists).");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6 text-center">MYCO2.app</h1>
        <p className="text-center mb-8 text-gray-300">
          Walk. Cycle. Earn. Save the planet.
        </p>
        {user ? (
          <div className="space-y-4">
            <p className="text-center text-green-400">Signed in as <b>{user.email}</b></p>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded border-4 border-black transition"
            >
              {loading ? 'Loading...' : 'Sign Out'}
            </button>
            {error && <p className="text-center mt-4 text-sm text-red-400">{error}</p>}
            {message && <p className="text-center mt-4 text-sm text-green-400">{message}</p>}
          </div>
        ) : (
          <>
            <form className="space-y-4" onSubmit={handleSignIn}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white pr-10"
                  required
                />
                <span
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer select-none"
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{userSelect: 'none'}}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.083 3.75 6.015 6.75 9.75 6.75 1.772 0 3.487-.457 4.97-1.277M21.75 12c-.512-.922-1.18-1.855-1.98-2.777m-2.31-2.488A9.716 9.716 0 0 0 12 5.25c-2.083 0-4.167.75-6.02 2.223m12.48 0A9.72 9.72 0 0 1 21.75 12m-3.06-4.265l.01.011m-12.48 0l-.01.011m.01-.011A9.72 9.72 0 0 0 2.25 12m3.06 4.265l-.01-.011m12.48 0l.01-.011m-12.48 0A9.72 9.72 0 0 1 2.25 12m16.77 4.265A10.477 10.477 0 0 1 21.75 12m-9.75 6.75c-3.735 0-7.667-3-9.75-6.75.512-.922 1.18-1.855 1.98-2.777m2.31-2.488A9.716 9.716 0 0 1 12 5.25c2.083 0 4.167.75 6.02 2.223" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75 12 13.5m0 0-3.75-3.75m3.75 3.75V6.75m0 6.75c-2.083 0-4.167-.75-6.02-2.223m12.48 0A9.72 9.72 0 0 0 21.75 12c-2.083 3.75-6.015 6.75-9.75 6.75-1.772 0-3.487-.457-4.97-1.277" />
                    </svg>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded border-4 border-black transition w-1/2 mr-2"
                >
                  {loading ? 'Loading...' : 'Sign In'}
                </button>
                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded border-4 border-black transition w-1/2 ml-2"
                >
                  {loading ? 'Loading...' : 'Sign Up'}
                </button>
              </div>
            </form>
            <button
              onClick={handleResetPassword}
              disabled={loading || !email}
              className="w-full mt-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded border-4 border-black transition"
            >
              {loading ? 'Loading...' : 'Forgot password?'}
            </button>
            {error && <p className="text-center mt-4 text-sm text-red-400">{error}</p>}
            {message && <p className="text-center mt-4 text-sm text-green-400">{message}</p>}
          </>
        )}
        <p className="text-center mt-4 text-sm text-gray-400">
          No credit card needed. Free to start.
        </p>
      </div>
    </div>
  );
}