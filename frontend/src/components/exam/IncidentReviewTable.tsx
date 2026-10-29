import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import type { ExamIncident, IncidentStatus } from '../../types/exam';

interface IncidentReviewTableProps {
  incidents: ExamIncident[];
  onSelectIncident: (incident: ExamIncident) => void;
  onQuickUpdateStatus: (incidentId: string, status: IncidentStatus) => void;
}

export const IncidentReviewTable: React.FC<IncidentReviewTableProps> = ({
  incidents,
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

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            PENDING REVIEW
          </span>
        );
      case 'in_review':
        return (
          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-blue-600" />
            IN REVIEW
          </span>
        );
      case 'dismissed':
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-slate-500" />
            DISMISSED (FALSE POSITIVE)
          </span>
        );
      case 'resolved':
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            RESOLVED
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search desk, incident ID, or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-2 text-xs bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="in_review">In Review</option>
              <option value="dismissed">Dismissed (False Positive)</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-2 text-xs bg-white focus:outline-hidden hidden sm:block"
            >
              <option value="all">All Event Types</option>
              <option value="Repeated Head-Turn Cues">Repeated Head-Turn</option>
              <option value="Restricted Zone Intrusion">Restricted Zone Intrusion</option>
              <option value="Prolonged Absence">Prolonged Absence</option>
              <option value="Multiple Faces In Frame">Multiple Faces</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <strong>{filtered.length}</strong> of {incidents.length} incidents
        </div>
      </div>

      {/* 2. Incidents Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <h4 className="font-semibold text-slate-800 text-sm">
              Certified Proctor Review Queue
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Click row or 'Inspect' to evaluate details & append notes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Desk & Session</th>
                <th className="py-3 px-4">Observable Event</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-center">Provenance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inc) => (
                <tr 
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {inc.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{inc.desk_label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inc.session_id} &bull; {inc.timestamp}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">{inc.event_type}</span>
                    {inc.reviewer_notes && (
                      <p className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5" title={inc.reviewer_notes}>
                        {inc.reviewer_notes}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px]" title="Analytical detection score">
                      {(inc.confidence * 100).toFixed(0)}%
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-bold">
                      {inc.source}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {getStatusBadge(inc.status)}
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1.5">
                      {inc.status === 'pending_review' && (
                        <button
                          type="button"
                          onClick={() => onQuickUpdateStatus(inc.id, 'in_review')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors"
                        >
                          Mark In Review
                        </button>
                      )}

                      {inc.status === 'in_review' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onQuickUpdateStatus(inc.id, 'dismissed')}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-[11px] font-semibold transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickUpdateStatus(inc.id, 'resolved')}
                            className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[11px] font-semibold transition-colors shadow-xs"
                          >
                            Resolve
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectIncident(inc)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        title="View details & audit trail"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
