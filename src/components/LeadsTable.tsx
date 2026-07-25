import React, { useState } from 'react';
import { Lead, LeadStatus, User } from '../types';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Eye, 
  Code2, 
  User as UserIcon, 
  Plus, 
  ShieldAlert, 
  Calendar, 
  Building2 
} from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  users: User[];
  currentUser: User;
  onSelectLead: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenNewLead: () => void;
  onToggleApiInspector: (endpointInfo: { method: string; url: string; headers: any; response: any }) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  users,
  currentUser,
  onSelectLead,
  onUpdateStatus,
  onDeleteLead,
  onOpenNewLead,
  onToggleApiInspector
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [repFilter, setRepFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'value' | 'score' | 'name'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Filter logic
  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || l.source === sourceFilter;
    const matchesRep =
      repFilter === 'ALL' ||
      (repFilter === 'UNASSIGNED' && !l.assignedToId) ||
      l.assignedToId === repFilter;

    return matchesSearch && matchesStatus && matchesSource && matchesRep;
  });

  // Sort logic
  filtered.sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'createdAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculation
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedLeads = filtered.slice(startIndex, startIndex + limit);

  const toggleSort = (field: 'createdAt' | 'value' | 'score' | 'name') => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  const handleInspectCurrentApi = () => {
    let token = currentUser.role === 'admin' ? 'token-admin-123' : 'token-john-456';
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status: statusFilter,
      source: sourceFilter,
      assignedTo: repFilter,
      search,
      sortBy,
      order
    }).toString();

    const responsePayload = {
      data: paginatedLeads,
      total,
      page,
      limit,
      totalPages
    };

    onToggleApiInspector({
      method: 'GET',
      url: `/api/leads?${queryParams}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      response: responsePayload
    });
  };

  const getStatusBadgeClass = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONTACTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'QUALIFIED':
        return 'bg-blue-100/60 text-blue-800 border-blue-300';
      case 'PROPOSAL_SENT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'WON':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LOST':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by name, email, company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="WON">Closed Won</option>
              <option value="LOST">Closed Lost</option>
            </select>

            {/* Rep Filter */}
            <select
              value={repFilter}
              onChange={(e) => {
                setRepFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none text-slate-700 font-medium"
            >
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* Inspect API Button */}
            <button
              onClick={handleInspectCurrentApi}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 text-slate-200 hover:text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Inspect JSON API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Lead / Company</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600 text-right" onClick={() => toggleSort('value')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Deal Value</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600 text-center" onClick={() => toggleSort('score')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>AI Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('createdAt')}>
                  <div className="flex items-center space-x-1">
                    <span>Created Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">No matching leads found</p>
                    <p className="text-xs mt-1">Try adjusting search filters or adding a new lead.</p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const assignedUser = users.find((u) => u.id === lead.assignedToId);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Lead Name & Company */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{lead.company}</span>
                          <span className="text-slate-300">•</span>
                          <span>{lead.email}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getStatusBadgeClass(lead.status)} focus:outline-none cursor-pointer`}
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="PROPOSAL_SENT">Proposal Sent</option>
                          <option value="WON">Closed Won</option>
                          <option value="LOST">Closed Lost</option>
                        </select>
                      </td>

                      {/* Deal Value */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        ${lead.value ? lead.value.toLocaleString() : '0'}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] border border-slate-200">
                          {lead.source}
                        </span>
                      </td>

                      {/* AI Score */}
                      <td className="py-3.5 px-4 text-center">
                        {lead.score ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 uppercase">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            {lead.score}/100
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unscored</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4">
                        {assignedUser ? (
                          <div className="flex items-center space-x-2">
                            <img src={assignedUser.avatarUrl} alt={assignedUser.name} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-slate-700 font-medium">{assignedUser.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onSelectLead(lead)}
                            title="View Full Details"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Lead Button (Admin Only Enforcement Client & Server) */}
                          <button
                            onClick={() => onDeleteLead(lead.id)}
                            title={currentUser.role === 'admin' ? 'Delete Lead (Admin Only)' : 'Delete Lead (Admin privilege required)'}
                            className={`p-1 rounded transition-colors ${
                              currentUser.role === 'admin'
                                ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-300 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <div>
            Showing <span className="font-bold text-slate-900">{total === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(startIndex + limit, total)}</span> of{' '}
            <span className="font-bold text-slate-900">{total}</span> total leads
          </div>

          <div className="flex items-center space-x-4">
            {/* Page Size Select */}
            <div className="flex items-center space-x-2">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
              </select>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
