import React, { useState } from 'react';
import { Lead, LeadStatus, User, AIAnalysisResult } from '../types';
import { 
  X, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  User as UserIcon, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  DollarSign, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Check, 
  Tag, 
  Calendar, 
  History, 
  ShieldAlert 
} from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onReassign: (leadId: string, userId: string | null) => void;
  onAddNote: (leadId: string, content: string) => Promise<void>;
  onDeleteLead: (leadId: string) => void;
  onAnalyzeWithAi: (leadId: string) => Promise<AIAnalysisResult>;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  users,
  currentUser,
  onClose,
  onUpdateStatus,
  onReassign,
  onAddNote,
  onDeleteLead,
  onAnalyzeWithAi
}) => {
  if (!lead) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes' | 'details'>('overview');
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // AI analysis state
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // RBAC error banner state
  const [rbacError, setRbacError] = useState<string | null>(null);

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNoteLoading(true);
    try {
      await onAddNote(lead.id, newNote.trim());
      setNewNote('');
    } catch (err: any) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await onAnalyzeWithAi(lead.id);
      setAiResult(res);
    } catch (err: any) {
      alert('AI analysis error: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteAttempt = () => {
    if (currentUser.role !== 'admin') {
      setRbacError('Permission Denied: Only Admin users can delete leads. (Server returns HTTP 403 Forbidden)');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete lead ${lead.name}?`)) {
      onDeleteLead(lead.id);
      onClose();
    }
  };

  const copyDraftEmail = () => {
    if (!aiResult) return;
    const fullText = `Subject: ${aiResult.draftEmailSubject}\n\n${aiResult.draftEmailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const assignedUser = users.find((u) => u.id === lead.assignedToId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Drawer Header */}
        <div className="p-5 bg-slate-900 text-white border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                {lead.source}
              </span>
              <span className="text-slate-400 text-xs font-mono">ID: {lead.id}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">{lead.name}</h2>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{lead.company}</span>
              <span className="text-slate-500">•</span>
              <span>{lead.title}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status & Assignment Quick Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline Stage</label>
            <select
              value={lead.status}
              onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="NEW">New Lead</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="WON">Closed Won</option>
              <option value="LOST">Closed Lost</option>
            </select>
          </div>

          {/* Assigned Rep Picker */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Rep</label>
            <select
              value={lead.assignedToId || ''}
              onChange={(e) => onReassign(lead.id, e.target.value || null)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">-- Unassigned --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Value Badge */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estimated Deal Value</label>
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg font-bold text-emerald-800 flex items-center justify-between">
              <span>${lead.value ? lead.value.toLocaleString() : '0'}</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* RBAC Error Banner if non-admin attempts delete */}
        {rbacError && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{rbacError}</span>
            </div>
            <button onClick={() => setRbacError(null)} className="text-rose-500 font-bold ml-2">Dismiss</button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-4 bg-white text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity Trail ({lead.activities?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Notes ({lead.notes?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Contact Details</span>
          </button>
        </div>

        {/* Drawer Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: OVERVIEW & AI */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* AI Score & Analysis Box */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-indigo-800/60 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-sm tracking-wide">Gemini 3.6 Flash Lead Intelligence</h3>
                  </div>

                  <button
                    onClick={handleRunAiAnalysis}
                    disabled={aiLoading}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
                  >
                    {aiLoading ? 'Analyzing...' : 'Analyze / Refresh'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-indigo-900/40">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">AI Lead Score</p>
                    <p className="text-2xl font-black text-indigo-400 mt-0.5">
                      {aiResult ? aiResult.score : lead.score || 75}<span className="text-xs font-normal text-slate-400">/100</span>
                    </p>
                  </div>

                  <div className="text-center sm:text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Calculated Priority</p>
                    <p className="text-xs font-bold text-amber-300 capitalize mt-1">
                      {aiResult ? aiResult.priority : lead.priority}
                    </p>
                  </div>

                  <div className="text-center sm:text-left">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Deal Conversion Potential</p>
                    <p className="text-xs font-bold text-emerald-400 mt-1">
                      {(aiResult ? aiResult.score : lead.score || 75) > 80 ? 'High Confidence' : 'Moderate'}
                    </p>
                  </div>
                </div>

                {/* AI Summary & Email Draft */}
                {aiResult && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-indigo-900/50 text-xs">
                    <div>
                      <p className="text-indigo-300 font-bold mb-1">Strategic AI Summary:</p>
                      <p className="text-slate-300 leading-relaxed">{aiResult.summary}</p>
                    </div>

                    <div>
                      <p className="text-rose-400 font-bold mb-1">Identified Deal Risks:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {aiResult.dealRisks.map((risk, idx) => (
                          <li key={idx}>{risk}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-amber-300 font-bold mb-1">Recommended Next Action:</p>
                      <p className="text-slate-200 bg-slate-950/80 p-2 rounded border border-slate-800">{aiResult.nextRecommendedAction}</p>
                    </div>

                    {/* Email Draft Box */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-indigo-900/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300">Drafted Outreach Email (AI):</span>
                        <button
                          onClick={copyDraftEmail}
                          className="flex items-center space-x-1 text-[10px] bg-indigo-600/40 hover:bg-indigo-600 text-white px-2 py-1 rounded"
                        >
                          {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedEmail ? 'Copied' : 'Copy Email'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-300">Subject: {aiResult.draftEmailSubject}</p>
                      <pre className="whitespace-pre-wrap font-sans text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                        {aiResult.draftEmailBody}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Lead Summary Info Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">Lead Metadata</h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Created Timestamp</span>
                    <span className="font-semibold text-slate-800">{new Date(lead.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Last Updated</span>
                    <span className="font-semibold text-slate-800">{new Date(lead.updatedAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Source Channel</span>
                    <span className="font-semibold text-slate-800">{lead.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Assignee Rep</span>
                    <span className="font-semibold text-slate-800">{assignedUser ? assignedUser.name : 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVITY TIMELINE TRAIL */}
          {activeTab === 'activity' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Lifecycle History & Activity Trail</span>
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {lead.activities && lead.activities.length > 0 ? (
                  lead.activities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Bullet icon */}
                      <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">{act.actorName}</span>
                          <span className="text-slate-400 text-[10px]">{new Date(act.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700">{act.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic">No activity logs recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4 text-xs">
              {/* Add Note Input */}
              <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                <label className="font-bold text-slate-800 block">Add Internal Note</label>
                <textarea
                  rows={3}
                  placeholder="Record call summary, client feedback, or next steps..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={noteLoading || !newNote.trim()}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{noteLoading ? 'Saving...' : 'Post Note'}</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3 pt-2">
                {lead.notes && lead.notes.length > 0 ? (
                  lead.notes.map((note) => (
                    <div key={note.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{note.authorName}</span>
                          <span
                            className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${
                              note.authorRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {note.authorRole}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[10px]">{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-xs">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-center py-6">No notes added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900">Contact Details</h4>

                <div className="space-y-2 text-slate-700">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{lead.email || 'No email provided'}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{lead.phone || 'No phone provided'}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>
                      {lead.company} ({lead.title})
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Lead Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 font-semibold text-[11px] flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={handleDeleteAttempt}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-semibold transition-colors ${
              currentUser.role === 'admin'
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Lead {currentUser.role !== 'admin' && '(Admin Only)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
