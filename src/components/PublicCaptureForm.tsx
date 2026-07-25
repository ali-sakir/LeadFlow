import React, { useState } from 'react';
import { 
  Globe, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Building2, 
  Mail, 
  Phone, 
  User as UserIcon, 
  DollarSign, 
  MessageSquare, 
  Sparkles, 
  Code 
} from 'lucide-react';

interface PublicCaptureFormProps {
  onSubmitPublicLead: (formData: any) => Promise<any>;
}

export const PublicCaptureForm: React.FC<PublicCaptureFormProps> = ({ onSubmitPublicLead }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    source: 'Website',
    value: 25000,
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Please provide your name and work email.');
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmitPublicLead(formData);
      setSubmittedLead(result.lead || result);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        title: '',
        source: 'Website',
        value: 25000,
        notes: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/#public-capture`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner / Intro */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xs border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Public Inbound Lead Capture Engine</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Public Lead Capture Portal</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Unauthenticated form endpoint (<code className="text-blue-300 font-mono bg-slate-800 px-1 py-0.5 rounded">POST /api/leads/public</code>). Submissions automatically create new leads with status <span className="font-bold text-blue-400">NEW</span> and trigger activity history logs.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
            <span>{copiedUrl ? 'Copied Share Link!' : 'Copy Form URL'}</span>
          </button>

          <button
            onClick={() => setShowEmbedCode(!showEmbedCode)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Code className="w-4 h-4" />
            <span>{showEmbedCode ? 'Hide Embed Code' : 'Get Embed Widget'}</span>
          </button>
        </div>
      </div>

      {/* Optional Embed Code Snippet Drawer */}
      {showEmbedCode && (
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
          <p className="text-indigo-400 font-bold font-sans">Website Embed Code (HTML/JavaScript):</p>
          <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-[11px] text-emerald-400 border border-slate-800">
{`<form id="leadflow-form" action="${window.location.origin}/api/leads/public" method="POST">
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="Work Email" required />
  <input type="text" name="company" placeholder="Company Name" />
  <button type="submit">Submit Request</button>
</form>`}
          </pre>
        </div>
      )}

      {/* Main Submission Form or Success View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        {submittedLead ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Inquiry Received Successfully!</h3>
              <p className="text-xs text-slate-500">
                Lead reference <code className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{submittedLead.id}</code> has been captured into LeadFlow CRM pipeline under status <span className="font-bold text-slate-800">NEW</span>.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
              <p className="font-bold text-slate-700 border-b border-slate-200 pb-1">Submitted Details:</p>
              <div className="flex justify-between text-slate-600">
                <span>Prospect Name:</span>
                <span className="font-semibold text-slate-900">{submittedLead.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Company:</span>
                <span className="font-semibold text-slate-900">{submittedLead.company}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email:</span>
                <span className="font-semibold text-slate-900">{submittedLead.email}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Initial Score:</span>
                <span className="font-bold text-indigo-600">{submittedLead.score}/100</span>
              </div>
            </div>

            <button
              onClick={() => setSubmittedLead(null)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Get in Touch with Our Enterprise Sales Team</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill out the inquiry form below. Your request will be instantly evaluated by our CRM pipeline.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>

              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Work Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="eleanor@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="Vance Technologies"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>

              {/* Job Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Job Title</label>
                <input
                  type="text"
                  placeholder="Director of Operations"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>

              {/* Estimated Budget / Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Estimated Annual Budget ($)
                </label>
                <select
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 bg-white"
                >
                  <option value={10000}>$10,000 - $25,000</option>
                  <option value={25000}>$25,000 - $50,000</option>
                  <option value={75000}>$50,000 - $100,000</option>
                  <option value={150000}>$100,000+ Enterprise</option>
                </select>
              </div>
            </div>

            {/* Notes / Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Inquiry Details / Requirements
              </label>
              <textarea
                rows={3}
                placeholder="Tell us about your team size, target deployment timeline, or specific platform requirements..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting request...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Sales Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
