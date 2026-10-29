import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileCheck2
} from 'lucide-react';
import type { AcademicResource, ResourceType } from '../../types/academic';
import { academicApi } from '../../services/academicApi';

interface AcademicResourceViewProps {
  onActivityLogged?: (title: string, type: 'info' | 'success') => void;
}

const RESOURCE_TYPES: ResourceType[] = [
  'Lecture Notes',
  'Question Paper',
  'Practice Exercise',
  'Reference Guide',
];

const SUBJECTS = [
  'Algorithms',
  'Operating Systems',
  'Database Systems',
  'Computer Networks',
  'Distributed Systems',
  'Aptitude',
  'Compilers',
  'Machine Learning',
];

export const AcademicResourceView: React.FC<AcademicResourceViewProps> = ({
  onActivityLogged,
}) => {
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  // Add Resource Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resSubject, setResSubject] = useState('Algorithms');
  const [resType, setResType] = useState<ResourceType>('Lecture Notes');
  const [resTags, setResTags] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Notice Banner for Placeholder Download click
  const [placeholderNotice, setPlaceholderNotice] = useState<string | null>(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await academicApi.getResources(searchQuery, selectedSubject, selectedType);
      setResources(data);
    } catch (err) {
      console.error('Failed to load academic resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [searchQuery, selectedSubject, selectedType]);

  const handleOpenAddModal = () => {
    setResTitle('');
    setResSubject('Algorithms');
    setResType('Lecture Notes');
    setResTags('');
    setResDescription('');
    setResUrl('');
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || resTitle.trim().length < 3) {
      setFormError('Please enter a descriptive title (at least 3 characters).');
      return;
    }
    if (!resDescription.trim() || resDescription.trim().length < 5) {
      setFormError('Please provide a brief summary of the resource content (at least 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const parsedTags = resTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const created = await academicApi.createResource({
        title: resTitle.trim(),
        subject: resSubject,
        resource_type: resType,
        tags: parsedTags.length > 0 ? parsedTags : [resSubject],
        description: resDescription.trim(),
        url: resUrl.trim() || undefined,
      });

      setResources(prev => [created, ...prev]);
      setFormSuccess('Resource metadata successfully cataloged in the repository!');

      if (onActivityLogged) {
        onActivityLogged(`New resource published: "${created.title}" (${created.subject})`, 'info');
      }

      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      setFormError('Failed to catalog resource. Please verify fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccessResource = async (res: AcademicResource) => {
    try {
      await academicApi.downloadResource(res.id);
      setResources(prev => prev.map(r => r.id === res.id ? { ...r, downloads_count: r.downloads_count + 1 } : r));

      if (res.is_placeholder || !res.url.startsWith('http')) {
        setPlaceholderNotice(
          `Accessing Catalog Reference: "${res.title}". Note: UniVerse validates and stores resource metadata. This is an official placeholder catalog entry (${res.url}). No physical file binary was transferred.`
        );
      } else {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Failed to register download', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Catalog Action */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Campus Academic Resource Repository</h3>
          <p className="text-xs text-slate-500">
            Open-access lecture notes, previous question papers, and lab manuals verified by campus departments.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Catalog Academic Resource
        </button>
      </div>

      {/* 2. Notice Banner when viewing placeholder */}
      {placeholderNotice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{placeholderNotice}</p>
          </div>
          <button
            onClick={() => setPlaceholderNotice(null)}
            className="text-amber-600 hover:text-amber-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Search and Dual Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, keywords, or topics (e.g., Graph, OS, ACID)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Format:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">All Types</option>
              {RESOURCE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Resources Cards Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 font-medium animate-pulse">
          Filtering academic resources...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {res.subject}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      &bull; {res.resource_type}
                    </span>
                  </div>

                  {res.is_placeholder ? (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      Metadata Ref
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                      External Link
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug mb-1.5">
                  {res.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
                  {res.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {res.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/70 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  <span>By {res.uploaded_by}</span>
                  <span className="mx-1">&bull;</span>
                  <span>{res.downloads_count} views</span>
                </div>

                <button
                  onClick={() => handleAccessResource(res)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {res.is_placeholder ? (
                    <>
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Inspect Record
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Resource
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catalog New Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Catalog Academic Resource</h3>
                <p className="text-xs text-slate-500">Record metadata and verified web references</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="mt-4 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g., CS305: Distributed Consensus Protocols Guide"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Academic Subject *
                  </label>
                  <select
                    value={resSubject}
                    onChange={(e) => setResSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    disabled={submitting}
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Resource Type *
                  </label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as ResourceType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    disabled={submitting}
                  >
                    {RESOURCE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={resTags}
                  onChange={(e) => setResTags(e.target.value)}
                  placeholder="e.g., Raft, Consensus, Distributed Systems"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Description / Content Abstract *
                </label>
                <textarea
                  rows={3}
                  value={resDescription}
                  onChange={(e) => setResDescription(e.target.value)}
                  placeholder="Summary of lecture notes, question paper solutions, or lab exercises..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  External Resource URL (Optional)
                </label>
                <input
                  type="url"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://ocw.mit.edu/courses/... (Leave blank for internal archive reference)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={submitting}
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block mb-0.5">Integrity & Storage Notice:</span>
                UniVerse saves verified academic metadata. If no external HTTP link is specified, the system stores an explicit placeholder catalog URI without fake file upload claims.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Cataloging...' : 'Publish to Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
