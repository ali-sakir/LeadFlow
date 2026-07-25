import React, { useState, useEffect, useCallback } from 'react';
import { User, Lead, LeadStatus, Role, AIAnalysisResult, TestResult } from './types';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadsTable } from './components/LeadsTable';
import { PublicCaptureForm } from './components/PublicCaptureForm';
import { AnalyticsView } from './components/AnalyticsView';
import { TeamManagement } from './components/TeamManagement';
import { ApiDocsAndTests } from './components/ApiDocsAndTests';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { NewLeadModal } from './components/NewLeadModal';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { AuthPage } from './components/AuthPage';

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(() => {
    return localStorage.getItem('leadflow_token') || 'token-admin-123';
  });

  const [showAuthScreen, setShowAuthScreen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('leadflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      id: 'user-admin-1',
      name: 'Sarah Connor',
      email: 'admin@company.com',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      department: 'Sales Management',
      active: true
    };
  });

  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'public' | 'analytics' | 'team' | 'api-docs'>('kanban');

  // Lead Detail Drawer State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // New Lead Modal State
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);

  // API Inspector Drawer State
  const [apiInspectorInfo, setApiInspectorInfo] = useState<{
    method: string;
    url: string;
    headers: any;
    response: any;
  } | null>(null);

  // Get Auth Token for API Requests
  const getAuthToken = useCallback(() => {
    if (userToken) return userToken;
    if (currentUser.role === 'admin') return 'token-admin-123';
    if (currentUser.id === 'user-member-2') return 'token-marcus-789';
    if (currentUser.id === 'user-member-3') return 'token-elena-101';
    return `token-${currentUser.id}`;
  }, [currentUser, userToken]);

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setUserToken(token);
    localStorage.setItem('leadflow_token', token);
    localStorage.setItem('leadflow_user', JSON.stringify(user));
    setShowAuthScreen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('leadflow_token');
    localStorage.removeItem('leadflow_user');
    setUserToken(null);
    setShowAuthScreen(true);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    let token = `token-${user.id}`;
    if (user.id === 'user-admin-1') token = 'token-admin-123';
    if (user.id === 'user-member-1') token = 'token-john-456';
    if (user.id === 'user-member-2') token = 'token-marcus-789';
    if (user.id === 'user-member-3') token = 'token-elena-101';

    setUserToken(token);
    localStorage.setItem('leadflow_token', token);
    localStorage.setItem('leadflow_user', JSON.stringify(user));
  };

  // Fetch all leads
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads?limit=100', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      if (res.ok) {
        const body = await res.json();
        setLeads(body.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  }, [getAuthToken]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [getAuthToken]);

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchLeads(), fetchUsers()]);
      setLoading(false);
    }
    loadData();
  }, [fetchLeads, fetchUsers]);

  // Keep selected lead in sync when leads array updates
  useEffect(() => {
    if (selectedLead) {
      const fresh = leads.find((l) => l.id === selectedLead.id);
      if (fresh) setSelectedLead(fresh);
    }
  }, [leads, selectedLead]);

  // Update Lead Status (Pipeline Movement)
  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Status update error: ${err.error || 'Server error'}`);
        return;
      }

      await fetchLeads();
    } catch (err: any) {
      alert('Network error updating status: ' + err.message);
    }
  };

  // Reassign Lead
  const handleReassignLead = async (leadId: string, userId: string | null) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ assignedToId: userId })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Reassignment error: ${err.error}`);
        return;
      }

      await fetchLeads();
    } catch (err: any) {
      alert('Network error reassigning lead: ' + err.message);
    }
  };

  // Delete Lead (Server Enforces Admin Only!)
  const handleDeleteLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Permission Denied: ${err.error}`);
        return;
      }

      if (selectedLead?.id === leadId) setSelectedLead(null);
      await fetchLeads();
    } catch (err: any) {
      alert('Failed to delete lead: ' + err.message);
    }
  };

  // Add Note to Lead
  const handleAddNote = async (leadId: string, content: string) => {
    const res = await fetch(`/api/leads/${leadId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add note');
    }

    await fetchLeads();
  };

  // Create Lead (In-App)
  const handleCreateLead = async (leadData: any) => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(leadData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create lead');
    }

    await fetchLeads();
  };

  // Public Form Submission
  const handleSubmitPublicLead = async (formData: any) => {
    const res = await fetch('/api/leads/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit public lead');
    }

    await fetchLeads();
    return data;
  };

  // Update User Role (Admin Only Enforced Client & Server)
  const handleUpdateRole = async (userId: string, newRole: Role) => {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update user role');
    }

    await fetchUsers();
  };

  // Run AI Analysis
  const handleAnalyzeWithAi = async (leadId: string): Promise<AIAnalysisResult> => {
    const res = await fetch(`/api/leads/${leadId}/ai-analyze`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI analysis failed');
    }

    const result = await res.json();
    await fetchLeads();
    return result;
  };

  // Run Automated Integration Tests
  const handleRunAutomatedTests = async (): Promise<{ summary: any; results: TestResult[] }> => {
    const res = await fetch('/api/tests/run', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    });

    if (!res.ok) {
      throw new Error('Automated test suite failed to execute');
    }

    return await res.json();
  };

  if (showAuthScreen) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onCancel={() => setShowAuthScreen(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row antialiased">
      {/* Left Side Panel Navigation */}
      <Header
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading LeadFlow CRM Pipeline...</p>
            </div>
          ) : (
            <>
              {activeTab === 'kanban' && (
                <KanbanBoard
                  leads={leads}
                  users={users}
                  currentUser={currentUser}
                  onSelectLead={setSelectedLead}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenNewLead={() => setIsNewLeadOpen(true)}
                />
              )}

              {activeTab === 'table' && (
                <LeadsTable
                  leads={leads}
                  users={users}
                  currentUser={currentUser}
                  onSelectLead={setSelectedLead}
                  onUpdateStatus={handleUpdateStatus}
                  onDeleteLead={handleDeleteLead}
                  onOpenNewLead={() => setIsNewLeadOpen(true)}
                  onToggleApiInspector={setApiInspectorInfo}
                />
              )}

              {activeTab === 'public' && <PublicCaptureForm onSubmitPublicLead={handleSubmitPublicLead} />}

              {activeTab === 'analytics' && <AnalyticsView leads={leads} users={users} />}

              {activeTab === 'team' && (
                <TeamManagement
                  users={users}
                  currentUser={currentUser}
                  onUpdateRole={handleUpdateRole}
                  onSwitchUser={handleSwitchUser}
                />
              )}

              {activeTab === 'api-docs' && <ApiDocsAndTests onRunAutomatedTests={handleRunAutomatedTests} />}
            </>
          )}
        </main>
      </div>

      {/* Slide-over Drawer for Selected Lead */}
      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          users={users}
          currentUser={currentUser}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleUpdateStatus}
          onReassign={handleReassignLead}
          onAddNote={handleAddNote}
          onDeleteLead={handleDeleteLead}
          onAnalyzeWithAi={handleAnalyzeWithAi}
        />
      )}

      {/* Modal for Creating New Lead */}
      {isNewLeadOpen && (
        <NewLeadModal users={users} onClose={() => setIsNewLeadOpen(false)} onCreateLead={handleCreateLead} />
      )}

      {/* Floating JSON API Live Inspector Modal */}
      {apiInspectorInfo && <ApiInspectorModal info={apiInspectorInfo} onClose={() => setApiInspectorInfo(null)} />}
    </div>
  );
}
