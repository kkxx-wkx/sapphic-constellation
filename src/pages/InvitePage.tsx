import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ArrowLeft,
  UserPlus,
  Copy,
  Check,
  Shield,
  Eye,
  Lock,
  Users,
  Heart,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RelationshipType } from '../types';

export default function InvitePage() {
  const { state, createInvitation } = useApp();
  const [step, setStep] = useState(1);
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [proposedAlias, setProposedAlias] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('friend');
  const [createdInvitation, setCreatedInvitation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const relationshipTypes: { value: RelationshipType; label: string; icon: React.ElementType }[] = [
    { value: 'friend', label: 'Friend', icon: Users },
    { value: 'date', label: 'Dated', icon: Heart },
    { value: 'same_event', label: 'Same Event', icon: Calendar },
    { value: 'introduced_by_friend', label: 'Introduced', icon: UserCheck },
  ];

  const handleCreate = async () => {
  if (!proposedAlias.trim()) return;

  setLoading(true);
  setError(null);

  const { data, error: err } = await createInvitation(
    inviteeEmail.trim(),
    proposedAlias.trim(),
    relationshipType
  );

  if (err) {
    setError(err.message);
    setLoading(false);
    return;
  }

  if (data) {
    const link = `${window.location.origin}/consent/${data.token}`;
    setCreatedInvitation(link);
    setStep(3);
  }

  setLoading(false);
};

  const handleCopy = () => {
    if (createdInvitation) {
      navigator.clipboard.writeText(createdInvitation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!state.user || !state.profile) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <UserPlus className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Create Your Profile First</h1>
          <p className="text-white/60 mb-6">You need a profile before inviting others.</p>
          <Link to="/profile" className="btn-primary inline-flex items-center gap-2">
            Complete Profile
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

      <main className="relative z-10 px-6 py-12 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-light mb-6">
            <UserPlus className="w-4 h-4 text-violet-300" />
            <span className="text-sm text-violet-200">Invite Someone</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Share Your Stars</span>
          </h1>
          <p className="text-lg text-white/60 max-w-md mx-auto">
            Invite someone to your constellation. They'll see only what you consent to share.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl mb-8">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-0.5 ${step > s ? 'bg-gradient-to-r from-blue-500 to-violet-500' : 'bg-white/10'}`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
  Recipient Note Optional
</label>
<div className="relative">
  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
  <input
    type="text"
    value={inviteeEmail}
    onChange={(e) => setInviteeEmail(e.target.value)}
    placeholder="e.g., 小A / River / 同学1"
    className="input-field pl-12"
  />
</div>
<p className="text-xs text-white/40 mt-2">
  This is only a private note for you. No email will be sent. You will copy the invite link and share it yourself.
</p>
              </div>

              <button
  onClick={() => setStep(2)}
  className="btn-primary w-full"
>
  Continue
</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
                  Proposed Alias for Them
                </label>
                <input
                  type="text"
                  value={proposedAlias}
                  onChange={(e) => setProposedAlias(e.target.value)}
                  placeholder="e.g., Luna Eclipse"
                  className="input-field"
                />
                <p className="text-xs text-white/40 mt-2">
                  This is your label for them. They can choose their own display name.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-white/80">
                  Relationship Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {relationshipTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setRelationshipType(type.value)}
                      className={`p-4 rounded-xl transition-all duration-200 flex items-center gap-3 border ${
                        relationshipType === type.value
                          ? 'glass-panel border-blue-400/40'
                          : 'glass-panel-light border-transparent hover:border-white/20'
                      }`}
                    >
                      <type.icon
                        className={`w-5 h-5 ${relationshipType === type.value ? 'text-blue-300' : 'text-white/50'}`}
                      />
                      <span className={`text-sm ${relationshipType === type.value ? 'text-white' : 'text-white/70'}`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-panel-light rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">Privacy Protected</h3>
                    <p className="text-xs text-white/50">
                      The connection will only appear after they consent. No one sees anything without mutual permission.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!proposedAlias.trim() || loading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Generate Invite Link'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && createdInvitation && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-emerald-300" />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Invite Link Generated!</h2>
                <p className="text-white/60 text-sm">
  Copy this private link and send it through WeChat, QQ, Xiaohongshu, iMessage, or any messaging app.
  They will only appear after they explicitly approve.
</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={createdInvitation}
                  readOnly
                  className="input-field flex-1 text-sm font-mono"
                />
                <button onClick={handleCopy} className="btn-secondary px-4 flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="glass-panel-light rounded-xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Invitation for</span>
                  <span className="text-sm text-white">{proposedAlias}</span>
                  <div className="flex items-center justify-between">
  <span className="text-sm text-white/60">Share method</span>
  <span className="text-sm text-white">Copy link manually</span>
</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Email</span>
                  <span className="text-sm text-white">{inviteeEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Relationship</span>
                  <span className="text-sm text-blue-300">
                    {relationshipTypes.find((t) => t.value === relationshipType)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Status</span>
                  <span className="text-sm text-amber-300">Pending</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/graph" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" />
                  View Constellation
                </Link>
                <button
                  onClick={() => {
                    setStep(1);
                    setInviteeEmail('');
                    setProposedAlias('');
                    setCreatedInvitation(null);
                    setCreatedToken(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: 'Consent First', desc: 'They accept before appearing' },
            { icon: Eye, title: 'You Choose', desc: 'Select what details to share' },
            { icon: Lock, title: 'Always Private', desc: 'No one sees without permission' },
          ].map((item, i) => (
            <div key={i} className="glass-panel-light p-4 rounded-xl text-center">
              <item.icon className="w-5 h-5 text-blue-300 mx-auto mb-2" />
              <h3 className="text-sm font-medium mb-1">{item.title}</h3>
              <p className="text-xs text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
