import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import type { CampusLocation } from '../../types/rides';
import { FALLBACK_EDGES } from '../../services/ridesApi';

interface CampusGraphMapProps {
  locations: CampusLocation[];
  highlightedPath?: string[];
  activeOrigin?: string;
  activeDestination?: string;
  onSelectNode?: (nodeId: string) => void;
}

export const CampusGraphMap: React.FC<CampusGraphMapProps> = ({
  locations,
  highlightedPath = [],
  activeOrigin,
  activeDestination,
  onSelectNode,
}) => {
  const [hoveredNode, setHoveredNode] = useState<CampusLocation | null>(null);

  // Helper to get coordinates for a node ID
  const getNode = (id: string) => locations.find(l => l.id === id);

  const isEdgeHighlighted = (u: string, v: string) => {
    if (highlightedPath.length < 2) return false;
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      if (
        (highlightedPath[i] === u && highlightedPath[i + 1] === v) ||
        (highlightedPath[i] === v && highlightedPath[i + 1] === u)
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Campus Road Graph & Routing Topology</h3>
            <p className="text-xs text-slate-500">12 Connected nodes with weighted kilometre distances</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Active Path
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Campus Waypoint
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-2/1 bg-slate-50/70 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full p-4">
          <defs>
            <linearGradient id="activeEdgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>

          {/* Road Edges */}
          {FALLBACK_EDGES.map(([u, v, dist], idx) => {
            const nodeU = getNode(u);
            const nodeV = getNode(v);
            if (!nodeU || !nodeV) return null;

            const isHighlighted = isEdgeHighlighted(u, v);
            const midX = (nodeU.x + nodeV.x) / 2;
            const midY = (nodeU.y + nodeV.y) / 2;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={nodeU.x}
                  y1={nodeU.y}
                  x2={nodeV.x}
                  y2={nodeV.y}
                  stroke={isHighlighted ? '#2563EB' : '#CBD5E1'}
                  strokeWidth={isHighlighted ? 1.6 : 0.8}
                  strokeDasharray={isHighlighted ? 'none' : '1.5,1.5'}
                  className="transition-all duration-300"
                />
                {/* Distance text label at edge midpoint */}
                <text
                  x={midX}
                  y={midY - 1}
                  fontSize="2"
                  textAnchor="middle"
                  fill={isHighlighted ? '#1D4ED8' : '#94A3B8'}
                  fontWeight={isHighlighted ? 'bold' : 'normal'}
                >
                  {dist}km
                </text>
              </g>
            );
          })}

          {/* Road Nodes */}
          {locations.map((loc) => {
            const isOrigin = loc.id === activeOrigin;
            const isDest = loc.id === activeDestination;
            const isInPath = highlightedPath.includes(loc.id);

            let nodeColor = '#64748B'; // slate-500 default
            if (isOrigin) nodeColor = '#16A34A'; // green origin
            else if (isDest) nodeColor = '#DC2626'; // red dest
            else if (isInPath) nodeColor = '#2563EB'; // blue in path

            return (
              <g
                key={loc.id}
                onClick={() => onSelectNode && onSelectNode(loc.id)}
                onMouseEnter={() => setHoveredNode(loc)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Outer Ring */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r={isOrigin || isDest ? 3.2 : 2.4}
                  fill="#FFFFFF"
                  stroke={nodeColor}
                  strokeWidth={isOrigin || isDest || isInPath ? 1.2 : 0.7}
                />
                {/* Center Core */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r={isOrigin || isDest ? 1.6 : 1.1}
                  fill={nodeColor}
                />

                {/* Node Label Text */}
                <text
                  x={loc.x}
                  y={loc.y + 4.2}
                  fontSize="2.1"
                  textAnchor="middle"
                  fill="#0F172A"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {loc.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Information Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-2.5 shadow-md text-xs pointer-events-none animate-in fade-in duration-150">
            <span className="font-bold text-slate-900 block">{hoveredNode.name}</span>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>Category: {hoveredNode.category}</span>
              <span>&bull;</span>
              <span className="font-mono text-slate-600">ID: {hoveredNode.id}</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any location pin to quick-select origin or destination in search forms.</span>
        <span className="font-mono">Topology: Bidirectional Metric Space</span>
      </div>
    </div>
  );
};
