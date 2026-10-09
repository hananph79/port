import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin');
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        navigate('/admin');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(160deg, #FAFAF7 0%, #FEF3C7 60%, #FAFAF7 100%)',
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-amber-700"
            style={{ color: '#78716C' }}
          >
            <ArrowLeft size={14} /> Back to Portfolio
          </Link>
        </div>

        <div
          className="p-8 rounded-3xl bg-white border"
          style={{
            borderColor: '#E8DCC8',
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.12), 0 4px 24px rgba(26, 18, 9, 0.06)',
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(245, 158, 11, 0.12)' }}
            >
              <Lock size={28} style={{ color: '#F59E0B' }} />
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'Syne, sans-serif', color: '#1A1209' }}
            >
              Admin Portal
            </h1>
            <p className="text-sm mt-1" style={{ color: '#78716C' }}>
              Sign in to edit and publish updates to your portfolio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: '#1A1209' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none transition-all"
                style={{ borderColor: '#E8DCC8', color: '#1A1209' }}
                placeholder="admin@yourportfolio.com"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = '#F59E0B';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E8DCC8';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: '#1A1209' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border bg-white text-sm outline-none transition-all"
                  style={{ borderColor: '#E8DCC8', color: '#1A1209' }}
                  placeholder="••••••••"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F59E0B';
                    e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E8DCC8';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                color: '#1A1209',
                boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
