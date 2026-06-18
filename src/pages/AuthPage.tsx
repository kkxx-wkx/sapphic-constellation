import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // After signup, user is automatically signed in (email confirmation is off)
        navigate('/profile');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/graph');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="stars-bg" />
      <div className="stars-pattern" />

      <div className="relative z-10 w-full max-w-md px-6">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/20 to-violet-500/20 border border-blue-400/30 flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-300" />
          </div>
          <span className="text-xl font-semibold glow-text">Sapphic Constellation</span>
        </Link>

        <div className="glass-panel p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 gradient-text">
              {mode === 'signin' ? 'Welcome Back' : 'Join the Constellation'}
            </h1>
            <p className="text-white/60">
              {mode === 'signin'
                ? 'Sign in to view your constellation'
                : 'Create an account to get started'}
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                mode === 'signin'
                  ? 'glass-panel text-white border-blue-400/30'
                  : 'glass-panel-light text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                mode === 'signup'
                  ? 'glass-panel text-white border-violet-400/30'
                  : 'glass-panel-light text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-400/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Create a password' : 'Your password'}
                  className="input-field pl-12 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {mode === 'signin' && (
            <p className="text-center text-sm text-white/50 mt-6">
              Don't have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                Sign up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p className="text-center text-sm text-white/50 mt-6">
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
