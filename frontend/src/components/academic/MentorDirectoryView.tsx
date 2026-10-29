import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck, 
  Send, 
  AlertCircle, 
  X
} from 'lucide-react';
import type { PeerMentor, MentorshipRequest } from '../../types/academic';
import type { UserRole } from '../../types/navigation';
import { academicApi } from '../../services/academicApi';

interface MentorDirectoryViewProps {
  activeRole: UserRole;
  onActivityLogged?: (title: string, type: 'info' | 'success' | 'warning') => void;
}

export const MentorDirectoryView: React.FC<MentorDirectoryViewProps> = ({
  activeRole,
  onActivityLogged,
}) => {
  const [mentors, setMentors] = useState<PeerMentor[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Selected Mentor for Details or Request Modal
  const [selectedMentor, setSelectedMentor] = useState<PeerMentor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Request Form
  const [requestTopic, setRequestTopic] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mentorList, requestList] = await Promise.all([
        academicApi.getMentors(searchQuery, availabilityFilter),
        academicApi.getMentorshipRequests(),
      ]);
      setMentors(mentorList);
      setRequests(requestList);
    } catch (err) {
      console.error('Failed to load mentorship directory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, availabilityFilter]);

  const handleOpenRequestModal = (mentor: PeerMentor) => {
    setSelectedMentor(mentor);
    setRequestTopic('');
    setRequestMessage('');
    setRequestError('');
    setRequestSuccess('');
    setIsRequestModalOpen(true);
  };

  const handleOpenDetailModal = (mentor: PeerMentor) => {
    setSelectedMentor(mentor);
    setIsDetailModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    if (!requestTopic.trim() || requestTopic.trim().length < 3) {
      setRequestError('Please provide a specific discussion topic (at least 3 characters).');
      return;
    }
    if (!requestMessage.trim() || requestMessage.trim().length < 5) {
      setRequestError('Please describe what you would like assistance with (at least 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setRequestError('');
      const newReq = await academicApi.createMentorshipRequest({
        mentor_id: selectedMentor.id,
        topic: requestTopic.trim(),
        message: requestMessage.trim(),
      });

      setRequests(prev => [newReq, ...prev]);
      setRequestSuccess(`Request successfully submitted to ${selectedMentor.name}!`);

      if (onActivityLogged) {
        onActivityLogged(`Mentorship request submitted to ${selectedMentor.name} for "${requestTopic.trim()}"`, 'info');
      }

      setTimeout(() => {
        setIsRequestModalOpen(false);
        setRequestSuccess('');
      }, 1600);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const updated = await academicApi.updateMentorshipRequestStatus(requestId, status);
      setRequests(prev => prev.map(r => r.id === requestId ? updated : r));

      if (onActivityLogged) {
        onActivityLogged(
          `Mentorship request for "${updated.topic}" was ${status}`,
          status === 'accepted' ? 'success' : 'warning'
        );
      }
    } catch (err) {
      console.error('Failed to update request status', err);
    }
  };

  const isMentorPersona = activeRole === 'peer-mentor';

  return (
    <div className="space-y-6">
      {/* 1. Role Context & Safeguards Notice */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800">
              Active Persona: {isMentorPersona ? 'Peer Mentor (Sarah Lin)' : 'Student (Alex Rivera)'}
            </span>
            <p className="text-slate-500 text-[11px]">
              Note: Persona switcher tests role-specific workflows (requesting vs reviewing) and does not represent cryptographic authentication.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 shrink-0 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Verified Peer Network &bull; 4 Mentors Available</span>
        </div>
      </div>

      {/* 2. Incoming Requests Review (Visible when in Peer Mentor mode OR can be inspected) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Mentorship Scheduling & Review Queue</h3>
              {isMentorPersona && (
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  Mentor Review View
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {isMentorPersona 
                ? 'Review incoming mentorship applications from junior peers. Accept or decline slots.'
                : 'Track your pending and confirmed mentorship applications with senior peers.'}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-400">
            {requests.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Mentor</th>
                <th className="py-2.5 px-4">Topic & Note</th>
                <th className="py-2.5 px-4">Submitted</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No mentorship requests recorded yet. Select a mentor below to request a session.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const isPending = req.status === 'pending';
                  const isAccepted = req.status === 'accepted';
                  const isDeclined = req.status === 'declined';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {req.student_name}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {req.mentor_name}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">
                          {req.topic}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          "{req.message}"
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {req.created_at}
                      </td>
                      <td className="py-3 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Accepted
                          </span>
                        )}
                        {isDeclined && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3" />
                            Declined
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {/* If in Peer Mentor persona and pending, allow Accept/Decline */}
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'accepted')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                              title="Accept Mentorship Session"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(req.id, 'declined')}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                              title="Decline Request"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {isAccepted ? 'Slot Confirmed' : 'Request Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by mentor name, skill (e.g. Graph, React), or expertise..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Availability:</span>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="all">All Mentors</option>
            <option value="available">Available Now</option>
            <option value="busy">Busy / At Capacity</option>
            <option value="away">Away on Co-op</option>
          </select>
        </div>
      </div>

      {/* 4. Mentors Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 font-medium animate-pulse">
          Filtering peer mentors...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mentors.map((mentor) => {
            const isAvailable = mentor.availability === 'available';
            const isBusy = mentor.availability === 'busy';

            return (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header: Name, Title, Rating */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {mentor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {mentor.name}
                        </h4>
                        <p 
                          className="text-xs text-slate-500"
                          dangerouslySetInnerHTML={{ __html: mentor.role_title }}
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {mentor.rating.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {mentor.sessions_count} sessions
                      </span>
                    </div>
                  </div>

                  {/* Availability status badge */}
                  <div className="mb-3">
                    {isAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Available for Mentorship
                      </span>
                    )}
                    {isBusy && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        High Demand (Limited Slots)
                      </span>
                    )}
                    {!isAvailable && !isBusy && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Away on Internship
                      </span>
                    )}
                  </div>

                  {/* Bio snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {mentor.bio}
                  </p>

                  {/* Skills & Expertise Chips */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex flex-wrap gap-1">
                      {mentor.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((exp, eIdx) => (
                        <span key={eIdx} className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenDetailModal(mentor)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    View Profile & Bio &rarr;
                  </button>

                  <button
                    onClick={() => handleOpenRequestModal(mentor)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    Request Mentorship
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mentor Detail Modal */}
      {isDetailModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0">
                  {selectedMentor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedMentor.name}</h3>
                  <p 
                    className="text-xs text-slate-500"
                    dangerouslySetInnerHTML={{ __html: selectedMentor.role_title }}
                  />
                </div>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-900 block mb-1">Biography</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed text-slate-600">
                  {selectedMentor.bio}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1">Technical Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMentor.skills.map((s, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1">Specialized Mentorship Areas</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMentor.expertise.map((e, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-slate-500 border-t border-slate-100 text-[11px]">
                <span>Completed Office Hours: {selectedMentor.sessions_count}</span>
                <span>Rating: {selectedMentor.rating.toFixed(2)} / 5.0</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenRequestModal(selectedMentor);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs"
              >
                Proceed to Request Form &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Mentorship Modal */}
      {isRequestModalOpen && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Request Peer Mentorship</h3>
                <p className="text-xs text-slate-500">
                  Mentor: <span className="font-semibold text-slate-800">{selectedMentor.name}</span>
                </p>
              </div>
              <button 
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="mt-4 space-y-3.5 text-xs">
              {requestError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{requestError}</span>
                </div>
              )}

              {requestSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{requestSuccess}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Discussion Topic / Goal *
                </label>
                <input
                  type="text"
                  value={requestTopic}
                  onChange={(e) => setRequestTopic(e.target.value)}
                  placeholder="e.g., Graph Dijkstra Detour Algorithm & Mock Coding"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Detailed Note to Mentor *
                </label>
                <textarea
                  rows={4}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Describe your current blockers, target campus drive, and preferred preparation goals..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={submitting}
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block mb-0.5">Safeguard Policy:</span>
                Duplicate submissions are checked automatically. Only one active pending request is allowed per mentor at a time.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
