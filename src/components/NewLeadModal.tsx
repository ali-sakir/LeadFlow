import React, { useState } from 'react';
import { User, LeadStatus, LeadPriority, LeadSource } from '../types';
import { X, Plus, User as UserIcon, Building2, Mail, Phone, DollarSign, Tag } from 'lucide-react';

interface NewLeadModalProps {
  users: User[];
  onClose: () => void;
  onCreateLead: (leadData: any) => Promise<void>;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ users, onClose, onCreateLead }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    source: 'Inbound' as LeadSource,
    status: 'NEW' as LeadStatus,
    priority: 'medium' as LeadPriority,
    value: 50000,
    assignedToId: '',
    tags: 'Qualified, Priority'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Lead name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tagArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onCreateLead({
        ...formData,
        tags: tagArray
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-4">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base">Add New Lead to Pipeline</h3>
            <p className="text-xs text-slate-400">Enter prospective customer contact details and pipeline attributes</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Lead Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. David Hassel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Work Email</label>
              <input
                type="email"
                placeholder="david@hasselcorp.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Company Name</label>
              <input
                type="text"
                placeholder="Hassel Corp"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            {/* Job Title */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Job Title</label>
              <input
                type="text"
                placeholder="VP Technology"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            {/* Deal Value */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Estimated Deal Value ($)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-bold"
              />
            </div>

            {/* Pipeline Stage */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Initial Stage</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              >
                <option value="NEW">New Lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL_SENT">Proposal Sent</option>
                <option value="WON">Closed Won</option>
                <option value="LOST">Closed Lost</option>
              </select>
            </div>

            {/* Lead Source */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              >
                <option value="Website">Website</option>
                <option value="Inbound">Inbound</option>
                <option value="Referral">Referral</option>
                <option value="Social">Social</option>
                <option value="Event">Event</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Partner">Partner</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Assign Sales Rep</label>
              <select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              >
                <option value="">-- Leave Unassigned --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Enterprise, SaaS, High Intent"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating Lead...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
