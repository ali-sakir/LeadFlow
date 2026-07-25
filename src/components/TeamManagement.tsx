import React, { useState } from 'react';
import { User, Role } from '../types';
import { Shield, UserCheck, Check, X, ShieldAlert, Users, ArrowRight, Sparkles } from 'lucide-react';

interface TeamManagementProps {
  users: User[];
  currentUser: User;
  onUpdateRole: (userId: string, newRole: Role) => Promise<void>;
  onSwitchUser: (user: User) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  users,
  currentUser,
  onUpdateRole,
  onSwitchUser
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setErrorMessage(null);
    if (currentUser.role !== 'admin') {
      setErrorMessage('Permission Denied: Only Admin users can change user roles. (Server returns HTTP 403 Forbidden)');
      return;
    }

    setLoadingId(userId);
    try {
      await onUpdateRole(userId, newRole);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update role');
    } finally {
      setLoadingId(null);
    }
  };

  const adminUser = users.find((u) => u.role === 'admin') || users[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Team Members & Permission Management</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Enforced on both client and server (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">PATCH /api/users/:id/role</code>). Admin role required for user role modification and lead deletion.
          </p>
        </div>

        {currentUser.role !== 'admin' && (
          <button
            onClick={() => onSwitchUser(adminUser)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Switch to Sarah Connor (Admin)</span>
          </button>
        )}
      </div>

      {/* Permission Error Banner if Member tries to edit */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Team Roster List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Active Team Members ({users.length})</span>
          <span className="text-[11px] font-normal text-slate-500">You are currently logged in as {currentUser.name} ({currentUser.role})</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {users.map((u) => (
            <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center space-x-3">
                <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                    {u.id === currentUser.id && (
                      <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-bold rounded border border-blue-200 uppercase tracking-wider">
                        Current Persona
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs">{u.email} • {u.department}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-slate-400 text-xs">Role:</span>
                <select
                  value={u.role}
                  disabled={loadingId === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs border focus:outline-none cursor-pointer ${
                    u.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>

                <button
                  onClick={() => onSwitchUser(u)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Switch Persona
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>Role Permission Matrix Comparison</span>
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <th className="p-3">Platform Capability / Action</th>
                <th className="p-3 text-center text-purple-700 bg-purple-50/50">Admin Role</th>
                <th className="p-3 text-center text-slate-700">Member Role</th>
                <th className="p-3">Server Endpoint Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-3 font-medium">View Leads Pipeline & Table</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 font-mono text-slate-500">GET /api/leads (Auth Token)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Create New Leads / Public Capture</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 font-mono text-slate-500">POST /api/leads / public</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Update Lead Stage, Details & Notes</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 font-mono text-slate-500">PATCH /api/leads/:id</td>
              </tr>
              <tr>
                <td className="p-3 font-medium font-bold text-rose-700">Delete Lead Record</td>
                <td className="p-3 text-center bg-purple-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                <td className="p-3 font-mono text-rose-600 font-semibold">DELETE /api/leads/:id (403 Forbidden for Member)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium font-bold text-purple-800">Change Team Member Roles</td>
                <td className="p-3 text-center bg-purple-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><X className="w-4 h-4 text-rose-500 mx-auto" /></td>
                <td className="p-3 font-mono text-purple-700 font-semibold">PATCH /api/users/:id/role (403 Forbidden for Member)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
