import { Person, Connection, RelationshipType, getRelationshipLabel, getDisplayName } from '../types';
import { X, Star, Eye, EyeOff, Users, Calendar, Shield } from 'lucide-react';

interface PersonDetailCardProps {
  person: Person | null;
  connections: Connection[];
  onClose: () => void;
}

const getDisplayModeLabel = (mode: Person['displayMode']): string => {
  switch (mode) {
    case 'real_name':
      return 'Full name visible';
    case 'hybrid':
      return 'Alias only';
    case 'anonymous':
      return 'Anonymous';
  }
};

const typeColors: Record<RelationshipType, string> = {
  friend: 'text-blue-300 bg-blue-500/20 border-blue-400/30',
  date: 'text-pink-300 bg-pink-500/20 border-pink-400/30',
  same_event: 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30',
  introduced_by_friend: 'text-violet-300 bg-violet-500/20 border-violet-400/30',
};

export default function PersonDetailCard({ person, connections, onClose }: PersonDetailCardProps) {
  if (!person) return null;

  const personConnections = connections.filter(
    (c) => c.sourcePersonId === person.id || c.targetPersonId === person.id
  );

  const displayName = getDisplayName(person);

  return (
    <div className="glass-panel h-full w-80 p-6 rounded-l-2xl flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-400/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <h2 className="font-semibold">Details</h2>
            <p className="text-xs text-white/50">Person info</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg glass-panel-light flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border-2 border-blue-400/30 flex items-center justify-center mb-4">
          <Star className="w-10 h-10 text-blue-300" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">{displayName}</h3>
        <div className="flex items-center gap-2 text-xs text-white/50">
          {person.displayMode === 'anonymous' ? (
            <EyeOff className="w-3 h-3" />
          ) : (
            <Eye className="w-3 h-3" />
          )}
          <span>{getDisplayModeLabel(person.displayMode)}</span>
        </div>
      </div>

      <div className="glass-panel-light rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">Consent Status</span>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
            person.consentStatus === 'approved'
              ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-400/30'
              : person.consentStatus === 'pending'
                ? 'text-amber-300 bg-amber-500/20 border border-amber-400/30'
                : 'text-red-300 bg-red-500/20 border border-red-400/30'
          }`}
        >
          {person.consentStatus.charAt(0).toUpperCase() + person.consentStatus.slice(1)}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-white/50" />
          <span>Connections ({personConnections.length})</span>
        </h4>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {personConnections.map((conn) => {
            const otherPersonId = conn.sourcePersonId === person.id ? conn.targetPersonId : conn.sourcePersonId;
            const colorClasses = typeColors[conn.relationshipType];
            return (
              <div
                key={conn.id}
                className={`${colorClasses} rounded-lg px-3 py-2 flex items-center gap-2`}
              >
                <Users className="w-4 h-4" />
                <span className="text-xs">{getRelationshipLabel(conn.relationshipType)}</span>
              </div>
            );
          })}
          {personConnections.length === 0 && (
            <p className="text-sm text-white/40 text-center py-4">No visible connections</p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 mt-4">
        <div className="flex items-center justify-between text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Joined {new Date(person.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
