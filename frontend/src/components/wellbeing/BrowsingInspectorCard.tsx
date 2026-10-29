import React, { useState } from 'react';
import { 
  Eye, 
  Search, 
  Filter, 
  Plus, 
  RotateCcw, 
  AlertCircle 
} from 'lucide-react';
import type { BrowsingEvent, CategorizationRule, DomainCategory } from '../../types/wellbeing';
import { normalizeDomain } from '../../services/wellbeingApi';

interface BrowsingInspectorCardProps {
  events: BrowsingEvent[];
  rules: CategorizationRule[];
  onUpdateRule: (domain: string, category: DomainCategory) => void;
  onResetRules: () => void;
}

export const BrowsingInspectorCard: React.FC<BrowsingInspectorCardProps> = ({
  events,
  rules,
  onUpdateRule,
  onResetRules,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | DomainCategory>('all');
  
  // Custom rule form
  const [newDomain, setNewDomain] = useState('');
  const [newCategory, setNewCategory] = useState<DomainCategory>('productive');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch = ev.normalized_domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.raw_domain_or_url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || ev.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeDomain(newDomain);
    if (!clean) return;
    onUpdateRule(clean, newCategory);
    setNewDomain('');
    setShowAddModal(false);
  };

  const getCategoryBadge = (cat: DomainCategory) => {
    switch (cat) {
      case 'productive':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Productive</span>;
      case 'distracting':
        return <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Distracting</span>;
      case 'neutral':
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Neutral</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Privacy Transparency Notice */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-blue-950 flex items-center gap-2">
            <span>ZERO BACKGROUND TRACKING DISCLOSURE</span>
            <span className="bg-blue-200/70 text-blue-900 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
              SYNTHETIC LOGS
            </span>
          </div>
          <p className="leading-relaxed text-blue-900/90">
            UniVerse does <strong>not</strong> monitor live browser tabs, background URLs, search queries, keystrokes, or page contents. 
            The records below are synthetic local demonstration logs to verify the client-side domain normalizer, categorization engine, and dwell estimators.
          </p>
        </div>
      </div>

      {/* 2. Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search domain (e.g. github, python)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="border border-slate-200 rounded-lg py-1.5 px-2 text-xs bg-white focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              <option value="productive">Productive Only</option>
              <option value="distracting">Distracting Only</option>
              <option value="neutral">Neutral Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={onResetRules}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Rules
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add / Override Rule
          </button>
        </div>
      </div>

      {/* 3. Add Rule Modal */}
      {showAddModal && (
        <div className="bg-slate-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm animate-in fade-in duration-200">
          <form onSubmit={handleAddRule} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs">Define Custom Classification Rule</h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                &times; Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Domain or URL (e.g. youtube.com)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="col-span-2 px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-mono"
                required
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as DomainCategory)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="productive">Productive</option>
                <option value="distracting">Distracting</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
              >
                Save Rule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Events Inspection Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-600" />
            <h4 className="font-semibold text-slate-800 text-sm">
              Normalized Browsing Inspection Table
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Showing {filteredEvents.length} events &bull; {rules.length} active rules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Raw Input / URL</th>
                <th className="py-3 px-4">Normalized Host</th>
                <th className="py-3 px-3 text-center">Category</th>
                <th className="py-3 px-4 text-center">Quick Reclassify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-slate-500">{ev.time_display}</td>
                  <td className="py-3 px-4 text-slate-500 truncate max-w-xs" title={ev.raw_domain_or_url}>
                    {ev.raw_domain_or_url}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{ev.normalized_domain}</td>
                  <td className="py-3 px-3 text-center">{getCategoryBadge(ev.category)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex rounded border border-slate-200 text-[10px] p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => onUpdateRule(ev.normalized_domain, 'productive')}
                        className={`px-1.5 py-0.5 rounded ${ev.category === 'productive' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Prod
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateRule(ev.normalized_domain, 'neutral')}
                        className={`px-1.5 py-0.5 rounded ${ev.category === 'neutral' ? 'bg-slate-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Neut
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateRule(ev.normalized_domain, 'distracting')}
                        className={`px-1.5 py-0.5 rounded ${ev.category === 'distracting' ? 'bg-rose-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Dist
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
