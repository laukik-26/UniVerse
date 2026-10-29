import React, { useState } from 'react';
import { 
  Search, 
  Filter
} from 'lucide-react';
import type { ExamIncident, IncidentStatus } from '../../types/exam';
import { StatusBadge } from '../common/StatusBadge';
import { Button } from '../common/Button';

interface IncidentReviewTableProps {
  incidents: ExamIncident[];
  selectedIncidentId?: string | null;
  onSelectIncident: (incident: ExamIncident) => void;
  onQuickUpdateStatus: (incidentId: string, status: IncidentStatus) => void;
}

export const IncidentReviewTable: React.FC<IncidentReviewTableProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onQuickUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = incidents.filter((inc) => {
    const matchesSearch = inc.desk_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesType = typeFilter === 'all' || inc.event_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search desk, incident ID, or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-2 text-xs bg-white focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="pending_review">Pending review</option>
              <option value="in_review">In review</option>
              <option value="dismissed">Dismissed</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-2 text-xs bg-white focus:outline-none hidden sm:block"
            >
              <option value="all">All event types</option>
              <option value="Repeated Head-Turn Cues">Repeated head-turn</option>
              <option value="Restricted Zone Intrusion">Restricted zone intrusion</option>
              <option value="Prolonged Absence">Prolonged absence</option>
              <option value="Multiple Faces In Frame">Multiple faces</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of {incidents.length} incidents
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-medium text-xs border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-medium">Incident ID</th>
                <th className="py-2.5 px-4 font-medium">Desk & session</th>
                <th className="py-2.5 px-4 font-medium">Observable event</th>
                <th className="py-2.5 px-3 text-center font-medium">Confidence</th>
                <th className="py-2.5 px-3 text-center font-medium">Source</th>
                <th className="py-2.5 px-3 text-center font-medium">Status</th>
                <th className="py-2.5 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inc) => {
                const isSelected = selectedIncidentId === inc.id;

                return (
                  <tr 
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 hover:bg-blue-50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {inc.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{inc.desk_label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inc.session_id} &bull; {inc.timestamp}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900">{inc.event_type}</span>
                      {inc.reviewer_notes && (
                        <p className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5" title={inc.reviewer_notes}>
                          {inc.reviewer_notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-xs font-medium text-slate-700">
                        {(inc.confidence * 100).toFixed(0)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {inc.source}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={inc.status} />
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {inc.status === 'pending_review' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onQuickUpdateStatus(inc.id, 'in_review')}
                          >
                            Mark in review
                          </Button>
                        )}
                        {inc.status === 'in_review' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onQuickUpdateStatus(inc.id, 'dismissed')}
                            >
                              Dismiss
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onQuickUpdateStatus(inc.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                        {(inc.status === 'dismissed' || inc.status === 'resolved') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectIncident(inc)}
                          >
                            Inspect
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
