import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Eye, EyeOff, Sparkles, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DisplayMode } from '../types';

export default function ProfilePage() {
  const { createProfile, state } = useApp();
  const navigate = useNavigate();
  const [alias, setAlias] = useState('');
  const [realName, setRealName] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('anonymous');
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10">
          <Star className="w-12 h-12 text-blue-300 animate-pulse" />
        </div>
      </div>
    );
  }

  if (state.profile) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 border-2 border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold mb-3 gradient-text">Profile Complete</h1>
          <p className="text-white/60 mb-8">
            Your profile is ready. View your constellation.
          </p>
          <Link to="/graph" className="btn-primary inline-flex items-center gap-2">
            <Star className="w-5 h-5" />
            View Constellation
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim()) return;

    setLoading(true);
    setError(null);

    const { error } = await createProfile(alias.trim(), realName.trim() || undefined, displayMode);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setCreated(true);
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center animate-float">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 border-2 border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold mb-3 gradient-text">Welcome to the Constellation</h1>
          <p className="text-white/60 mb-8">
            Your profile is ready. Start building your constellation.
          </p>
          <div className="space-y-3">
            <Link to="/graph" className="btn-primary inline-flex items-center gap-2 w-full justify-center">
              <Star className="w-5 h-5" />
              View Your Constellation
            </Link>
            <Link to="/invite" className="btn-secondary inline-flex items-center gap-2 w-full justify-center">
              <Users className="w-5 h-5" />
              Invite Someone
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="stars-pattern" />

      <nav className="relative z-10 px-6 py-6 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/20 to-violet-500/20 border border-blue-400/30 flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-300" />
          </div>
          <span className="text-xl font-semibold glow-text">Sapphic Constellation</span>
        </Link>
      </nav>

      <main className="relative z-10 px-6 py-12 max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-light mb-6">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-blue-200">Create Your Star</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Who Are You?</span>
          </h1>
          <p className="text-lg text-white/60">
            Choose how you appear. Default is anonymous - you can always change this later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Your Cosmic Alias *
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g., Nova Starlight"
              className="input-field"
              required
            />
            <p className="text-xs text-white/40 mt-2">
              This is your identifier in the constellation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Real Name (optional)
            </label>
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="e.g., Alex"
              className="input-field"
            />
            <p className="text-xs text-white/40 mt-2">
              Only shown if you choose "Real Name" display mode.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-white/80">
              Display Mode
            </label>
            <div className="space-y-3">
              {[
                {
                  value: 'anonymous' as const,
                  label: 'Anonymous',
                  desc: 'Appear as "Anonymous Star" to everyone',
                  icon: EyeOff,
                },
                {
                  value: 'hybrid' as const,
                  label: 'Alias Only',
                  desc: 'Show your cosmic alias only',
                  icon: Sparkles,
                },
                {
                  value: 'real_name' as const,
                  label: 'Real Name',
                  desc: 'Show your real name to approved connections',
                  icon: Eye,
                },
              ].map((mode) => (
                <label
                  key={mode.value}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                    displayMode === mode.value
                      ? 'glass-panel border-blue-400/30'
                      : 'glass-panel-light border-transparent hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayMode"
                    value={mode.value}
                    checked={displayMode === mode.value}
                    onChange={() => setDisplayMode(mode.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      displayMode === mode.value
                        ? 'bg-gradient-to-br from-blue-500 to-violet-500'
                        : 'bg-white/10'
                    }`}
                  >
                    <mode.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{mode.label}</div>
                    <div className="text-xs text-white/50">{mode.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!alias.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create My Star'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </main>
    </div>
  );
}
