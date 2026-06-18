import { RelationshipType, getRelationshipLabel } from '../types';
import { Filter, Users, Heart, Calendar, UserCheck } from 'lucide-react';

interface FilterPanelProps {
  showPending: boolean;
  setShowPending: (v: boolean) => void;
  selectedTypes: RelationshipType[];
  setSelectedTypes: (v: RelationshipType[]) => void;
  connectionCount: number;
  personCount: number;
}

const relationshipTypeOptions: { type: RelationshipType; icon: React.ElementType; label: string }[] = [
  { type: 'friend', icon: Users, label: 'Friend' },
  { type: 'date', icon: Heart, label: 'Dated' },
  { type: 'same_event', icon: Calendar, label: 'Same Event' },
  { type: 'introduced_by_friend', icon: UserCheck, label: 'Introduced' },
];

export default function FilterPanel({
  showPending,
  setShowPending,
  selectedTypes,
  setSelectedTypes,
  connectionCount,
  personCount,
}: FilterPanelProps) {
  const toggleType = (type: RelationshipType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <div className="glass-panel h-full w-72 p-6 rounded-r-2xl flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-400/20 flex items-center justify-center">
          <Filter className="w-5 h-5 text-blue-300" />
        </div>
        <div>
          <h2 className="font-semibold">Filters</h2>
          <p className="text-xs text-white/50">Customize your view</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <h3 className="text-sm font-medium mb-3 text-white/80">Relationship Types</h3>
          <div className="space-y-2">
            {relationshipTypeOptions.map(({ type, icon: Icon, label }) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-md border transition-all duration-200 flex items-center justify-center ${
                    selectedTypes.includes(type)
                      ? 'bg-gradient-to-br from-blue-500 to-violet-500 border-transparent'
                      : 'border-white/20 group-hover:border-white/40'
                  }`}
                  onClick={() => toggleType(type)}
                >
                  {selectedTypes.includes(type) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <Icon className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white/70 group-hover:text-white/90">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 mt-6">
        <div className="glass-panel-light rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">Visible People</span>
            <span className="text-sm font-semibold text-blue-300">{personCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Connections</span>
            <span className="text-sm font-semibold text-violet-300">{connectionCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
