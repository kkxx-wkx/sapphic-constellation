import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, Lock, Eye, Star, ArrowRight, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

const features = [
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your identity stays yours. Only show what you choose.',
  },
  {
    icon: Heart,
    title: 'Consent-Based',
    description: 'No one appears without your consent. No exceptions.',
  },
  {
    icon: Lock,
    title: 'No Rankings',
    description: 'No popularity scores. No hierarchies. Just connections.',
  },
  {
    icon: Eye,
    title: 'Mutual Visibility',
    description: 'Relationships only appear when both people agree.',
  },
];

export default function LandingPage() {
  const { state, signOut } = useApp();

  const handleSignOut = async () => {
    await signOut();
  };

  const primaryAction = state.user ? (
    state.profile ? (
      <Link to="/graph" className="btn-primary flex items-center gap-2">
        <Star className="w-5 h-5" />
        View Your Constellation
        <ArrowRight className="w-4 h-4" />
      </Link>
    ) : (
      <Link to="/profile" className="btn-primary flex items-center gap-2">
        <Star className="w-5 h-5" />
        Complete Your Profile
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  ) : (
    <Link to="/auth" className="btn-primary flex items-center gap-2">
      <Star className="w-5 h-5" />
      Create Your Star
      <ArrowRight className="w-4 h-4" />
    </Link>
  );

  const stats = [
    { value: '100%', label: 'Consent Required' },
    { value: '0', label: 'Public Profiles' },
    { value: '0', label: 'Rankings' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="stars-bg" />
      <div className="stars-pattern" />

      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/20 to-violet-500/20 border border-blue-400/30 flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-300" />
          </div>
          <span className="text-xl font-semibold glow-text">Sapphic Constellation</span>
        </Link>
        <div className="flex items-center gap-3">
          {state.user ? (
            <>
              {state.profile && (
                <Link to="/graph" className="btn-secondary text-sm">
                  My Constellation
                </Link>
              )}
              <Link to="/settings" className="btn-secondary text-sm">
                Settings
              </Link>
            </>
          ) : (
            <Link to="/auth" className="btn-secondary text-sm">
              Get Started
            </Link>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        <section className="px-6 pt-16 pb-24 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-light mb-8">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-blue-200">Privacy-Focused Social Mapping</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Map Your Stars</span>
            <br />
            <span className="text-white/90">With Consent</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            A privacy-first constellation map for building meaningful connections.
            Choose what you share, who sees it, and how you appear.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            {primaryAction}
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mb-24">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 gradient-text">
            Built Different
          </h2>
          <p className="text-center text-white/50 mb-16 max-w-xl mx-auto">
            Every feature designed around one principle: your consent, your control.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-panel p-8 rounded-2xl group hover:border-blue-400/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-400/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20 text-center">
          <div className="glass-panel max-w-3xl mx-auto p-12 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4 text-white">Ready to Map Your Constellation?</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              {state.user
                ? 'Your data is synced across devices. Invite others to build your constellation together.'
                : 'Create an account to get started. All data is synced across devices.'}
            </p>
            {!state.user && (
              <Link to="/auth" className="btn-primary inline-flex items-center gap-2">
                <Star className="w-5 h-5" />
                Begin Your Journey
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-6 py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            Sapphic Constellation - Privacy First, Always
          </p>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link to="/consent" className="hover:text-white/70 transition-colors">Consent</Link>
            <Link to="/settings" className="hover:text-white/70 transition-colors">Settings</Link>
            {state.user && (
              <button onClick={handleSignOut} className="hover:text-white/70 transition-colors flex items-center gap-1">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
