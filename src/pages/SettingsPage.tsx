import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  Lock,
  Eye,
  Shield,
  AlertTriangle,
  Check,
  Trash2,
  Download,
  UserX,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDisplayName, getRelationshipLabel, DisplayMode } from '../types';

export default function SettingsPage() {
  const {
    state,
    updateProfile,
    updateConnection,
    revokeConsent,
    signOut,
  } = useApp();

  const [saved, setSaved] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayModes: { value: DisplayMode; label: string; desc: string }[] = [
    { value: 'anonymous', label: 'Anonymous', desc: 'Appear as "Anonymous Star" to everyone' },
    { value: 'hybrid', label: 'Alias Only', desc: 'Show your cosmic alias only' },
    { value: 'real_name', label: 'Real Name', desc: 'Show your real name to approved connections' },
  ];

  const handleDisplayModeChange = async (mode: DisplayMode) => {
    if (!state.profile) return;
    setLoading(true);
    await updateProfile({ display_mode: mode });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setLoading(false);
  };

  const handleHideConnection = async (connectionId: string) => {
    await updateConnection(connectionId, { visibility: 'private' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      profile: state.profile,
      people: state.people,
      connections: state.connections,
      invitations: state.invitations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sapphic-constellation-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRevokeConsent = async () => {
    setLoading(true);
    await revokeConsent();
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!state.user || !state.profile) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <Shield className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
          <p className="text-white/60 mb-6">You need to be signed in to access settings.</p>
          <Link to="/auth" className="btn-primary inline-flex items-center gap-2">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="stars-pattern" />

      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/20 to-violet-500/20 border border-blue-400/30 flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-300" />
          </div>
          <span className="text-xl font-semibold glow-text">Sapphic Constellation</span>
        </Link>
        <Link to="/graph" className="btn-secondary text-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Map
        </Link>
      </nav>

      <main className="relative z-10 px-6 py-12 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-light mb-6">
            <Lock className="w-4 h-4 text-violet-300" />
            <span className="text-sm text-violet-200">Privacy Settings</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Your Privacy</span>
          </h1>
          <p className="text-lg text-white/60 max-w-md mx-auto">
            Control exactly what you share and who sees it.
          </p>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <Eye className="w-5 h-5 text-blue-300" />
              How You Appear
            </h2>
            <div className="space-y-3">
              {displayModes.map((mode) => (
                <label
                  key={mode.value}
                  onClick={() => handleDisplayModeChange(mode.value)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                    state.profile?.display_mode === mode.value
                      ? 'glass-panel border-blue-400/30'
                      : 'glass-panel-light border-transparent hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      state.profile?.display_mode === mode.value
                        ? 'border-blue-400 bg-gradient-to-br from-blue-500 to-violet-500'
                        : 'border-white/30'
                    }`}
                  >
                    {state.profile?.display_mode === mode.value && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{mode.label}</div>
                    <div className="text-xs text-white/50">{mode.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <Shield className="w-5 h-5 text-emerald-300" />
              Your Connections
            </h2>
            {state.connections.length === 0 ? (
              <p className="text-sm text-white/50 text-center py-4">No connections yet.</p>
            ) : (
              <div className="space-y-3">
                {state.connections.map((conn) => {
                  const otherPersonId = conn.sourcePersonId === state.profile?.id
                    ? conn.targetPersonId
                    : conn.sourcePersonId;
                  const otherPerson = state.people.find((p) => p.id === otherPersonId);

                  return (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between p-4 rounded-xl glass-panel-light"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {otherPerson ? getDisplayName(otherPerson) : 'Unknown'}
                        </div>
                        <div className="text-xs text-white/50">
                          {getRelationshipLabel(conn.relationshipType)}{' '}
                          {conn.visibility === 'mutual_only' && '(mutual only)'}
                        </div>
                      </div>
                      {conn.visibility !== 'private' && (
                        <button
                          onClick={() => handleHideConnection(conn.id)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-300 border border-amber-400/30 hover:bg-amber-500/20 transition-colors"
                        >
                          Hide
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="glass-panel p-6 rounded-2xl">
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <Download className="w-5 h-5 text-blue-300" />
              Export Your Data
            </h2>
            <p className="text-sm text-white/60 mb-4">
              Download all your data as a JSON file.
            </p>
            <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export All Data
            </button>
          </section>

          <section className="glass-panel p-6 rounded-2xl border-red-400/20">
            <h2 className="flex items-center gap-2 font-semibold mb-4 text-red-300">
              <UserX className="w-5 h-5" />
              Revoke Consent
            </h2>
            <p className="text-sm text-white/60 mb-4">
              This will hide your profile from the constellation. Your connections will become invisible.
            </p>
            <button
              onClick={handleRevokeConsent}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm hover:bg-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <UserX className="w-4 h-4" />
              {loading ? 'Updating...' : 'Revoke My Consent'}
            </button>
          </section>

          <section className="glass-panel p-6 rounded-2xl border-amber-400/20">
            <h2 className="flex items-center gap-2 font-semibold mb-4 text-amber-300">
              <LogOut className="w-5 h-5" />
              Sign Out
            </h2>
            <p className="text-sm text-white/60 mb-4">
              Sign out of your account. Your data will remain synced across devices.
            </p>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-sm hover:bg-amber-500/20 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </section>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs text-white/40">
            Your privacy is fundamental. No data is shared without your explicit consent.
          </p>
        </footer>
      </main>
    </div>
  );
}
