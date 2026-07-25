import React, { useState } from 'react';
import { Lead, LeadStatus, User } from '../types';
import { 
  Building2, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  User as UserIcon, 
  Search, 
  Filter, 
  Plus, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight
} from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  users: User[];
  currentUser: User;
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  onOpenNewLead: () => void;
}

const STAGES: { id: LeadStatus; label: string; color: string; bg: string; border: string }[] = [
  { id: 'NEW', label: 'New Lead', color: 'text-blue-600', bg: 'bg-blue-50/60', border: 'border-blue-200' },
  { id: 'CONTACTED', label: 'Contacted', color: 'text-amber-600', bg: 'bg-amber-50/60', border: 'border-amber-200' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'text-emerald-600', bg: 'bg-emerald-50/60', border: 'border-emerald-200' },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'text-purple-600', bg: 'bg-purple-50/60', border: 'border-purple-200' },
  { id: 'WON', label: 'Closed Won', color: 'text-blue-700', bg: 'bg-blue-100/40', border: 'border-blue-300' },
  { id: 'LOST', label: 'Closed Lost', color: 'text-slate-500', bg: 'bg-slate-100/80', border: 'border-slate-200' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  users,
  currentUser,
  onSelectLead,
  onUpdateStatus,
  onOpenNewLead
}) => {
  const [search, setSearch] = useState('');
  const [repFilter, setRepFilter] = useState<string>('ALL');

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());

    const matchesRep =
      repFilter === 'ALL' ||
      (repFilter === 'UNASSIGNED' && !lead.assignedToId) ||
      lead.assignedToId === repFilter;

    return matchesSearch && matchesRep;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-md border border-rose-200 flex items-center gap-1"><Flame className="w-3 h-3" /> Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-md border border-amber-200">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">Medium</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] text-slate-500 bg-slate-50 rounded-md">Low</span>;
    }
  };

  const nextStageMap: Record<LeadStatus, LeadStatus | null> = {
    NEW: 'CONTACTED',
    CONTACTED: 'QUALIFIED',
    QUALIFIED: 'PROPOSAL_SENT',
    PROPOSAL_SENT: 'WON',
    WON: null,
    LOST: null
  };

  const prevStageMap: Record<LeadStatus, LeadStatus | null> = {
    NEW: null,
    CONTACTED: 'NEW',
    QUALIFIED: 'CONTACTED',
    PROPOSAL_SENT: 'QUALIFIED',
    WON: 'PROPOSAL_SENT',
    LOST: 'PROPOSAL_SENT'
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by name, company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Rep Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium"
            >
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned Leads</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center space-x-4 text-xs text-slate-600">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            Total Leads: <span className="font-bold text-slate-900">{filteredLeads.length}</span>
          </div>
          <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 font-medium text-blue-900">
            Pipeline Value:{' '}
            <span className="font-bold text-blue-700">
              ${filteredLeads.reduce((sum, l) => sum + (l.value || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Pipeline Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
          const stageValueSum = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

          return (
            <div
              key={stage.id}
              className={`rounded-xl border ${stage.border} ${stage.bg} p-3 flex flex-col min-h-[550px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                <div className="flex items-center space-x-2">
                  <span className={`font-bold text-xs ${stage.color} tracking-wide uppercase`}>
                    {stage.label}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-slate-700 rounded-full border border-slate-200 shadow-2xs">
                    {stageLeads.length}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-600">
                  ${(stageValueSum / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {stageLeads.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg p-4 text-center">
                    <p className="text-[11px] text-slate-400 font-medium">No leads in {stage.label}</p>
                    <button
                      onClick={onOpenNewLead}
                      className="mt-2 text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Lead
                    </button>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const assignedUser = users.find((u) => u.id === lead.assignedToId);

                    return (
                      <div
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group relative"
                      >
                        {/* Top Metadata Row */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                            {lead.source}
                          </span>
                          {getPriorityBadge(lead.priority)}
                        </div>

                        {/* Name & Company */}
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {lead.name}
                        </h4>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-0.5 mb-2">
                          <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{lead.company}</span>
                        </div>

                        {/* Value & Score Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                          <div className="flex items-center text-xs font-extrabold text-slate-800">
                            ${lead.value ? lead.value.toLocaleString() : '0'}
                          </div>

                          {lead.score ? (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded border border-blue-200 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-blue-500" /> {lead.score}
                            </span>
                          ) : null}
                        </div>

                        {/* Footer Row: Assignee & Quick Actions */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px]">
                          {/* Assignee Avatar */}
                          <div className="flex items-center space-x-1.5">
                            {assignedUser ? (
                              <img
                                src={assignedUser.avatarUrl}
                                alt={assignedUser.name}
                                title={`Assigned to ${assignedUser.name}`}
                                className="w-5 h-5 rounded-full object-cover border border-slate-300"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                <UserIcon className="w-3 h-3" />
                              </div>
                            )}
                            <span className="text-slate-500 truncate max-w-[80px]">
                              {assignedUser ? assignedUser.name.split(' ')[0] : 'Unassigned'}
                            </span>
                          </div>

                          {/* Pipeline Shift Controls */}
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            {prevStageMap[stage.id] && (
                              <button
                                title={`Move back to ${prevStageMap[stage.id]}`}
                                onClick={() => onUpdateStatus(lead.id, prevStageMap[stage.id]!)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {nextStageMap[stage.id] && (
                              <button
                                title={`Move forward to ${nextStageMap[stage.id]}`}
                                onClick={() => onUpdateStatus(lead.id, nextStageMap[stage.id]!)}
                                className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
