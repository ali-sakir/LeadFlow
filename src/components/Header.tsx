import React, { useState } from 'react';
import { User } from '../types';
import { 
  BarChart3, 
  Users, 
  Plus, 
  Shield, 
  UserCheck, 
  Sparkles, 
  Table, 
  Kanban, 
  TestTube, 
  Globe,
  Menu,
  X,
  ChevronDown,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  activeTab: 'kanban' | 'table' | 'public' | 'analytics' | 'team' | 'api-docs';
  onSelectTab: (tab: 'kanban' | 'table' | 'public' | 'analytics' | 'team' | 'api-docs') => void;
  onOpenNewLead: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSwitchUser,
  activeTab,
  onSelectTab,
  onOpenNewLead,
  onLogout
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'kanban', label: 'Pipeline', icon: Kanban },
    { id: 'table', label: 'Leads Data', icon: Table },
    { id: 'public', label: 'Public Capture', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team Roles', icon: Users },
    { id: 'api-docs', label: 'API & Tests', icon: TestTube },
  ] as const;

  const handleNavClick = (tab: typeof activeTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center font-bold text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">LeadFlow Pro</span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase">
            CRM
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenNewLead}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Add Lead"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Left Side Panel (Sidebar) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-white transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Logo Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-white">LeadFlow Pro</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase tracking-wider">
                  CRM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Pipeline Intelligence</p>
            </div>
          </div>
        </div>

        {/* Action Button: Add Lead */}
        <div className="px-4 pt-5 pb-2">
          <button
            onClick={() => {
              onOpenNewLead();
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Lead</span>
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Sales Dashboard
            </p>
            <div className="space-y-1">
              {navItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white border-l-2 border-blue-500 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Analytics & Admin
            </p>
            <div className="space-y-1">
              {navItems.slice(3).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white border-l-2 border-blue-500 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User / Persona Switcher Section at bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-full flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  {currentUser.role === 'admin' ? (
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Admin
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-0.5">
                      <UserCheck className="w-2.5 h-2.5" /> Member
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400 truncate">{currentUser.department}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Persona Switch Popover */}
          {userDropdownOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 p-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-800 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Switch Role Persona</p>
                <p className="text-[10px] text-slate-500">Test client & server RBAC rules</p>
              </div>

              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u);
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                    currentUser.id === u.id
                      ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.department}</p>
                    </div>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase shrink-0 ${
                      u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {u.role}
                  </span>
                </button>
              ))}

              {onLogout && (
                <div className="pt-2 mt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / Switch Account</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}
    </>
  );
};
