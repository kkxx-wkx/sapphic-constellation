import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Shield,
  Eye,
  EyeOff,
  X,
  Check,
  Heart,
  Users,
  Calendar,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getRelationshipLabel, RelationshipType } from '../types';

const PENDING_CONSENT_KEY = 'pendingConsent';

interface PendingConsent {
  token: string;
  choice: 'anonymous' | 'with_name' | 'hide_connection' | 'reject';
  realName: string;
}

function savePendingConsent(data: PendingConsent) {
  sessionStorage.setItem(PENDING_CONSENT_KEY, JSON.stringify(data));
}

function loadPendingConsent(): PendingConsent | null {
  const raw = sessionStorage.getItem(PENDING_CONSENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingConsent;
  } catch {
    return null;
  }
}

function clearPendingConsent() {
  sessionStorage.removeItem(PENDING_CONSENT_KEY);
}

export default function ConsentAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { getInvitationByToken, state, acceptInvitation } = useApp();
  const [choice, setChoice] = useState<'anonymous' | 'with_name' | 'hide_connection' | 'reject' | null>(null);
  const [realName, setRealName] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<{
    id: string;
    proposedAlias: string;
    proposedRelationshipType: RelationshipType;
    status: string;
    createdAt: string;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [restoredPending, setRestoredPending] = useState(false);

  useEffect(() => {
    async function loadInvitation() {
      if (token) {
        const inv = await getInvitationByToken(token);
        if (inv) {
          setInvitation(inv);
        } else {
          setNotFound(true);
        }
      }
    }

    loadInvitation();
  }, [token, getInvitationByToken]);

  useEffect(() => {
    const pending = loadPendingConsent();
    if (pending && pending.token === token) {
      setChoice(pending.choice);
      setRealName(pending.realName);
      setRestoredPending(true);
    }
  }, [token]);

  useEffect(() => {
    if (!restoredPending || !state.user || !invitation || !token || !choice) return;
    if (invitation.status !== 'pending') return;

    setRestoredPending(false);
    setLoading(true);

    acceptInvitation(token, choice, realName.trim() || undefined).then((res) => {
      setResult(res);
      setLoading(false);
      clearPendingConsent();
    });
  }, [restoredPending, state.user, invitation, token, choice, realName, acceptInvitation]);

  if (notFound) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Invitation Not Found</h1>
          <p className="text-white/60 mb-6">
            This invitation doesn't exist or has expired.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!invitation) {
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

  if (invitation.status === 'rejected') {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Invitation Declined</h1>
          <p className="text-white/60 mb-6">
            This invitation was previously declined.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (invitation.status === 'approved') {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Already Accepted</h1>
          <p className="text-white/60 mb-6">
            This invitation has already been accepted. You're part of the constellation!
          </p>
          <Link to="/graph" className="btn-primary inline-flex items-center gap-2">
            View Constellation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <div
            className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-6 ${
              result.success
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 border-emerald-400/30'
                : 'bg-gradient-to-br from-red-500/20 to-red-400/10 border-red-400/30'
            }`}
          >
            {result.success ? (
              <Check className="w-8 h-8 text-emerald-300" />
            ) : (
              <X className="w-8 h-8 text-red-300" />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-3">
            {result.success ? (choice === 'reject' ? 'Declined' : 'Welcome!') : 'Error'}
          </h1>
          <p className="text-white/60 mb-6">{result.message}</p>
          {result.success && choice !== 'reject' ? (
            <Link to="/graph" className="btn-primary inline-flex items-center gap-2">
              View Constellation
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              Go Home
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  const typeIcons: Record<RelationshipType, React.ElementType> = {
    friend: Users,
    date: Heart,
    same_event: Calendar,
    introduced_by_friend: UserCheck,
  };
  const TypeIcon = typeIcons[invitation.proposedRelationshipType];

  const handleAccept = async () => {
    if (!token || !choice) return;

    if (!state.user) {
      savePendingConsent({ token, choice, realName: realName.trim() });
      navigate(`/auth?redirect=${encodeURIComponent(`/consent/${token}`)}`);
      return;
    }

    setLoading(true);
    const res = await acceptInvitation(token, choice, realName.trim() || undefined);
    setResult(res);
    setLoading(false);
    clearPendingConsent();
  };

  return (
    <div className="min-h-screen relative">
      <div className="stars-bg" />
      <div className="stars-pattern" />

      <nav className="relative z-10 px-6 py-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/20 to-violet-500/20 border border-blue-400/30 flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-300" />
          </div>
          <span className="text-xl font-semibold glow-text">Sapphic Constellation</span>
        </div>
      </nav>

      <main className="relative z-10 px-6 py-8 max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-light mb-6">
            <Shield className="w-4 h-4 text-emerald-300" />
            <span className="text-sm text-emerald-200">Consent Required</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            <span className="gradient-text">You're Invited</span>
          </h1>
        </div>

        <div className="glass-panel p-6 rounded-2xl mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-400/30 flex items-center justify-center">
              <Star className="w-7 h-7 text-blue-300" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Someone</h2>
              <p className="text-sm text-white/50">wants to connect with you</p>
            </div>
          </div>

          <div className="glass-panel-light rounded-xl p-4 space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Proposed Alias</span>
              <span className="text-sm text-white">{invitation.proposedAlias}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Relationship</span>
              <span className="text-sm text-blue-300 flex items-center gap-1">
                <TypeIcon className="w-4 h-4" />
                {getRelationshipLabel(invitation.proposedRelationshipType)}
              </span>
            </div>
          </div>

          <div className="glass-panel-light rounded-xl p-4 flex items-start gap-3 border border-emerald-400/20">
            <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm mb-1">Your Privacy is Protected</h3>
              <p className="text-xs text-white/50">
                Choose how you want to appear. No one sees your data without your explicit consent.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="font-semibold mb-4">How do you want to proceed?</h3>

          <div className="space-y-3 mb-6">
            {[
              {
                value: 'anonymous' as const,
                label: 'Anonymous',
                desc: 'Join as "Anonymous Star" - no personal details shared',
                icon: EyeOff,
              },
              {
                value: 'with_name' as const,
                label: 'With My Name',
                desc: 'Join and share your real name with this connection',
                icon: Eye,
              },
              {
                value: 'hide_connection' as const,
                label: 'Join Privately',
                desc: 'Join but hide this connection from the map',
                icon: Shield,
              },
              {
                value: 'reject' as const,
                label: 'Decline Invitation',
                desc: 'This will not create any connection',
                icon: X,
              },
            ].map((option) => (
              <label
                key={option.value}
                onClick={() => setChoice(option.value)}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  choice === option.value
                    ? 'glass-panel border-blue-400/40'
                    : 'glass-panel-light border-transparent hover:border-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    choice === option.value ? 'border-blue-400 bg-gradient-to-br from-blue-500 to-violet-500' : 'border-white/30'
                  }`}
                >
                  {choice === option.value && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-white/50">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {choice === 'with_name' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-white/80">
                Your Real Name
              </label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
              />
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={!choice || loading || (choice === 'with_name' && !realName.trim())}
            className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              choice === 'reject'
                ? 'bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30'
                : 'btn-primary'
            }`}
          >
            {loading ? (
              'Processing...'
            ) : choice === 'reject' ? (
              <>
                <X className="w-5 h-5" />
                Decline Invitation
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Accept & Join Constellation
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
