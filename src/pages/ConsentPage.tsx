import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  Shield,
  Check,
  X,
  Clock,
  Users,
  Heart,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRelationshipLabel, RelationshipType } from '../types';

const typeColors: Record<RelationshipType, string> = {
  friend: 'text-blue-300 bg-blue-500/20',
  date: 'text-pink-300 bg-pink-500/20',
  same_event: 'text-emerald-300 bg-emerald-500/20',
  introduced_by_friend: 'text-violet-300 bg-violet-500/20',
};

const typeIcons: Record<RelationshipType, React.ElementType> = {
  friend: Users,
  date: Heart,
  same_event: Clock,
  introduced_by_friend: UserCheck,
};

export default function ConsentPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const pendingCount = state.invitations.filter((r) => r.status === 'pending').length;

  const filteredRequests = state.invitations.filter(
    (r) => filter === 'all' || r.status === filter
  );

  if (!state.user || !state.profile) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <Shield className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
          <p className="text-white/60 mb-6">You need to be signed in to review consent.</p>
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
            <Shield className="w-4 h-4 text-emerald-300" />
            <span className="text-sm text-emerald-200">Invitations</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                {pendingCount} pending
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Your Invitations</span>
          </h1>
          <p className="text-lg text-white/60 max-w-md mx-auto">
            Track invitations you've sent and their status.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'glass-panel text-white border-blue-400/30'
                  : 'glass-panel-light text-white/60 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center">
              <Check className="w-12 h-12 text-emerald-300 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">
                {filter === 'all' ? 'No invitations yet' : `No ${filter} invitations`}
              </h3>
              <p className="text-sm text-white/50 mb-6">
                {filter === 'pending'
                  ? "You don't have any pending invitations."
                  : 'Invitations you create will appear here.'}
              </p>
              <Link to="/invite" className="btn-primary inline-flex items-center gap-2">
                Create an Invitation
              </Link>
            </div>
          ) : (
            filteredRequests.map((invitation) => {
              const TypeIcon = typeIcons[invitation.proposedRelationshipType];

              return (
                <div key={invitation.id} className="glass-panel p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                      <Star className="w-6 h-6 text-blue-300" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{invitation.proposedAlias}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            invitation.status === 'approved'
                              ? 'text-emerald-300 bg-emerald-500/20'
                              : invitation.status === 'pending'
                                ? 'text-amber-300 bg-amber-500/20'
                                : 'text-red-300 bg-red-500/20'
                          }`}
                        >
                          {invitation.status}
                        </span>
                      </div>

                      <p className="text-sm text-white/70 mb-4">
                        You invited them to connect as {getRelationshipLabel(invitation.proposedRelationshipType)}
                      </p>

                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                          typeColors[invitation.proposedRelationshipType]
                        } mb-4`}
                      >
                        <TypeIcon className="w-3 h-3" />
                        {getRelationshipLabel(invitation.proposedRelationshipType)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </span>
                        {invitation.status === 'pending' && (
                          <span className="text-amber-300">
                            Waiting for response
                          </span>
                        )}
                      </div>
                    </div>

                    {invitation.status === 'approved' && (
                      <div className="flex items-center gap-2 text-emerald-300 text-xs">
                        <Check className="w-4 h-4" />
                        Connected
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
