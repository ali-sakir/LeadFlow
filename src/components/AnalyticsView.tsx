import React from 'react';
import { Lead, User } from '../types';
import { BarChart3, TrendingUp, Trophy, Activity, DollarSign, Target, CheckCircle2, Building2 } from 'lucide-react';

interface AnalyticsViewProps {
  leads: Lead[];
  users: User[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ leads, users }) => {
  const totalLeads = leads.length;
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);

  const wonLeads = leads.filter((l) => l.status === 'WON');
  const lostLeads = leads.filter((l) => l.status === 'LOST');
  const closedCount = wonLeads.length + lostLeads.length;
  const winRate = closedCount > 0 ? Math.round((wonLeads.length / closedCount) * 100) : 0;

  const wonValueSum = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const avgDealSize = totalLeads > 0 ? Math.round(totalPipelineValue / totalLeads) : 0;

  // Pipeline breakdown
  const stageCounts = {
    NEW: leads.filter((l) => l.status === 'NEW').length,
    CONTACTED: leads.filter((l) => l.status === 'CONTACTED').length,
    QUALIFIED: leads.filter((l) => l.status === 'QUALIFIED').length,
    PROPOSAL_SENT: leads.filter((l) => l.status === 'PROPOSAL_SENT').length,
    WON: wonLeads.length,
    LOST: lostLeads.length
  };

  // Collect all activity logs across leads
  const allActivities = leads
    .flatMap((l) => (l.activities || []).map((act) => ({ ...act, leadName: l.name, company: l.company })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pipeline */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pipeline Value</p>
            <p className="text-2xl font-black text-slate-900 mt-1">${totalPipelineValue.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Across {totalLeads} active leads
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Closed Won Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed Won Revenue</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">${wonValueSum.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">{wonLeads.length} deals closed won</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sales Win Rate</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{winRate}%</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">{wonLeads.length} won vs {lostLeads.length} lost</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Deal Size */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Deal Size</p>
            <p className="text-2xl font-black text-slate-900 mt-1">${avgDealSize.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Per deal calculation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Distribution Bars */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Pipeline Stage Distribution & Funnel</span>
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            {Object.entries(stageCounts).map(([stageKey, count]) => {
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={stageKey} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{stageKey.replace('_', ' ')}</span>
                    <span className="text-slate-500">
                      {count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stageKey === 'WON'
                          ? 'bg-blue-600'
                          : stageKey === 'LOST'
                          ? 'bg-slate-400'
                          : stageKey === 'PROPOSAL_SENT'
                          ? 'bg-purple-500'
                          : stageKey === 'QUALIFIED'
                          ? 'bg-emerald-500'
                          : 'bg-blue-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rep Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Sales Rep Leaderboard</span>
          </h3>

          <div className="space-y-3 divide-y divide-slate-100">
            {users.map((u) => {
              const userLeads = leads.filter((l) => l.assignedToId === u.id);
              const userWonVal = userLeads
                .filter((l) => l.status === 'WON')
                .reduce((sum, l) => sum + (l.value || 0), 0);

              return (
                <div key={u.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{userLeads.length} Assigned Leads</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-600">${userWonVal.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">Closed Revenue</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Recent Activity Trail */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span>Real-time Global Pipeline Activity Feed</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {allActivities.map((act) => (
            <div key={act.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
                  {act.actorName.charAt(0)}
                </div>
                <div>
                  <p className="text-slate-800 font-medium">
                    <span className="font-bold text-slate-900">{act.actorName}</span> {act.description.toLowerCase()}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>
                      {act.leadName} ({act.company})
                    </span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{new Date(act.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
