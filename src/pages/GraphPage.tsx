import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { RelationshipType, Person, relationshipColors, getDisplayName, getRelationshipLabel } from '../types';
import { useApp } from '../context/AppContext';
import FilterPanel from '../components/FilterPanel';
import PersonDetailCard from '../components/PersonDetailCard';
import { Star, Home, Settings, Shield, UserPlus, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

cytoscape.use(fcose);

export default function GraphPage() {
  const { state } = useApp();
  const [selectedTypes, setSelectedTypes] = useState<RelationshipType[]>([
    'friend',
    'date',
    'same_event',
    'introduced_by_friend',
  ]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter connections to only show approved ones with correct visibility
  const visibleConnections = state.connections.filter(
    (c) =>
      c.sourceApproved &&
      c.targetApproved &&
      (c.visibility === 'visible' || c.visibility === 'mutual_only')
  );

  const filteredConnections = visibleConnections.filter((conn) => {
    if (!selectedTypes.includes(conn.relationshipType)) return false;
    return true;
  });

  const visiblePersonIds = new Set(
  filteredConnections.flatMap((c) => [c.sourcePersonId, c.targetPersonId])
);

const filteredPeople = state.people.filter(
  (p) =>
    p.consentStatus === 'approved' &&
    (
      visiblePersonIds.has(p.id) ||
      p.owner_id === state.user?.id ||
      p.profile_id === state.profile?.id
    )
);

  const elements: cytoscape.ElementDefinition[] = [
    ...filteredPeople.map((person) => ({
      data: {
        id: person.id,
        label: getDisplayName(person),
        alias: person.alias,
        displayMode: person.displayMode,
        consentStatus: person.consentStatus,
        connectionCount: visibleConnections.filter(
          (c) => c.sourcePersonId === person.id || c.targetPersonId === person.id
        ).length,
        isCurrentUser: person.profile_id === state.user?.id,
      },
    })),
    ...filteredConnections.map((conn) => ({
  data: {
    id: conn.id,
    source: conn.sourcePersonId,
    target: conn.targetPersonId,
    relationshipType: conn.relationshipType,
    relationshipColor: relationshipColors[conn.relationshipType],
    approved: conn.sourceApproved && conn.targetApproved,
  },
})),
  ];

  const handleNodeClick = useCallback(
    (event: cytoscape.EventObject) => {
      const node = event.target;
      const personId = node.id();
      const person = state.people.find((p) => p.id === personId);
      if (person) {
        setSelectedPerson(person);
      }
    },
    [state.people]
  );

  const handleNodeHover = useCallback((event: cytoscape.EventObject) => {
    const node = event.target;
    setHoveredId(node.id());
  }, []);

  const handleNodeUnhover = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  };

  const hoveredPerson = hoveredId ? state.people.find((p) => p.id === hoveredId) : null;
  console.log('Graph debug:', {
  people: state.people,
  connections: state.connections,
  visibleConnections,
  filteredConnections,
  elements,
});

  const cytoscapeStylesheet: cytoscape.Stylesheet[] = [
    {
      selector: 'node',
      style: {
        width: 40,
        height: 40,
        'background-color': '#1e3a5f',
        'border-width': 2,
        'border-color': '#60a5fa',
        shape: 'ellipse',
        label: 'data(label)',
        'font-size': 11,
        color: '#e0e7ff',
        'text-valign': 'bottom',
        'text-margin-y': 8,
        'font-family': 'Inter, system-ui, sans-serif',
        'text-shadow-color': '#000',
        'text-shadow-blur': 4,
        'text-shadow-opacity': 0.5,
      },
    },
    {
      selector: 'node[isCurrentUser = true]',
      style: {
        'border-width': 4,
        'border-color': '#f472b6',
        'background-color': '#2d1f4f',
      },
    },
    {
      selector: 'node:active',
      style: {
        'border-width': 4,
        'border-color': '#a78bfa',
        'background-color': '#2d1f4f',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': '#f472b6',
      },
    },
    {
  selector: 'edge',
  style: {
    width: 3,
    'curve-style': 'bezier',
    'line-color': 'data(relationshipColor)',
    'target-arrow-color': 'data(relationshipColor)',
    'target-arrow-shape': 'none',
    opacity: 0.9,
  },
},
  ];

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

  if (!state.user) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <Star className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
          <p className="text-white/60 mb-6">Sign in to view and build your constellation.</p>
          <Link to="/auth" className="btn-primary inline-flex items-center gap-2">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!state.profile) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="stars-bg" />
        <div className="stars-pattern" />
        <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-md text-center">
          <Star className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Complete Your Profile</h1>
          <p className="text-white/60 mb-6">Create your profile to view and build your constellation.</p>
          <Link to="/profile" className="btn-primary inline-flex items-center gap-2">
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  if (filteredPeople.length === 0) {
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
        <div className="relative z-10 px-6 py-12 max-w-lg mx-auto text-center">
          <div className="glass-panel p-12 rounded-3xl">
            <Star className="w-16 h-16 text-blue-300 mx-auto mb-6 opacity-50" />
            <h1 className="text-2xl font-bold mb-3">Your Constellation Awaits</h1>
            <p className="text-white/60 mb-8">
              Invite someone to start building your constellation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/invite" className="btn-primary inline-flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite Someone
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex">
      <div className="stars-bg" />
      <div className="stars-pattern" />

      <aside className="fixed left-0 top-0 bottom-0 z-20">
        <FilterPanel
          showPending={false}
          setShowPending={() => {}}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          connectionCount={filteredConnections.length}
          personCount={filteredPeople.length}
        />
      </aside>

      <main className="flex-1 ml-72 relative">
        <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-3 glass-panel rounded-2xl flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Star className="w-5 h-5 text-blue-300" />
            <span className="font-semibold glow-text text-sm">Sapphic Constellation</span>
          </Link>
          <div className="w-px h-5 bg-white/20" />
          <Link to="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <Link to="/invite" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Invite</span>
          </Link>
          <Link to="/consent" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <Shield className="w-4 h-4" />
            <span>Consent</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-white/70" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-white/70" />
          </button>
          <button
            onClick={handleFit}
            className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {hoveredPerson && !selectedPerson && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 glass-panel rounded-xl text-sm">
            <span className="text-white/60">Viewing: </span>
            <span className="font-medium">{getDisplayName(hoveredPerson)}</span>
          </div>
        )}

        <div ref={containerRef} className="w-full h-screen">
          <CytoscapeComponent
            elements={elements}
            style={{ width: '100%', height: '100%' }}
            stylesheet={cytoscapeStylesheet}
            layout={{
              name: 'fcose',
              quality: 'proof',
              fit: true,
              padding: 80,
              nodeDimensionsIncludeLabels: true,
              spacingFactor: 1.8,
              nodeRepulsion: 800000,
              idealEdgeLength: 150,
              animate: true,
              animationDuration: 500,
              randomize: false,
            }}
            pan={{ x: containerRef.current?.offsetWidth ? containerRef.current.offsetWidth / 2 : 500, y: containerRef.current?.offsetHeight ? containerRef.current.offsetHeight / 2 : 400 }}
            zoom={1}
            userPanningEnabled={true}
            userZoomingEnabled={true}
            boxSelectionEnabled={false}
            cy={(cy) => {
              cyRef.current = cy;
              cy.on('tap', 'node', handleNodeClick);
              cy.on('mouseover', 'node', handleNodeHover);
              cy.on('mouseout', 'node', handleNodeUnhover);

              cy.edges().forEach((edge) => {
                const type = edge.data('relationshipType') as RelationshipType;
                edge.style('line-color', relationshipColors[type]);
              });
            }}
          />
        </div>
      </main>

      <aside className="fixed right-0 top-0 bottom-0 z-20">
        <PersonDetailCard
          person={selectedPerson}
          connections={visibleConnections}
          onClose={() => setSelectedPerson(null)}
        />
      </aside>
    </div>
  );
}
