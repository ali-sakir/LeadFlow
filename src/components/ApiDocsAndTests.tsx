import React, { useState } from 'react';
import { TestResult } from '../types';
import { 
  TestTube, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Code2, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Terminal 
} from 'lucide-react';

interface ApiDocsAndTestsProps {
  onRunAutomatedTests: () => Promise<{ summary: any; results: TestResult[] }>;
}

export const ApiDocsAndTests: React.FC<ApiDocsAndTestsProps> = ({ onRunAutomatedTests }) => {
  const [testSummary, setTestSummary] = useState<any | null>(null);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleExecuteSuite = async () => {
    setRunningTests(true);
    try {
      const data = await onRunAutomatedTests();
      setTestSummary(data.summary);
      setTestResults(data.results);
    } catch (err: any) {
      alert('Test suite execution error: ' + err.message);
    } finally {
      setRunningTests(false);
    }
  };

  const copyCurl = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const API_ENDPOINTS = [
    {
      method: 'POST',
      path: '/api/auth/register',
      auth: 'Public (No Token)',
      description: 'Create a new user account (Sign Up) with Sales Member or Sales Admin role.',
      body: '{\n  "name": "Alex Morgan",\n  "email": "alex@company.com",\n  "password": "password123",\n  "role": "member",\n  "department": "Enterprise Sales"\n}',
      curl: `curl -X POST "${window.location.origin}/api/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alex Morgan", "email": "alex@company.com", "password": "password123", "role": "member"}'`,
      statuses: [
        { code: 201, desc: 'Created: Account registered successfully, returns User object & token.' },
        { code: 400, desc: 'Bad Request: Missing name, invalid email, or short password.' },
        { code: 409, desc: 'Conflict: Email already registered.' }
      ]
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      auth: 'Public (No Token)',
      description: 'Authenticate user credentials and receive access token.',
      body: '{\n  "email": "admin@company.com",\n  "password": "password123"\n}',
      curl: `curl -X POST "${window.location.origin}/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@company.com", "password": "password123"}'`,
      statuses: [
        { code: 200, desc: 'OK: Credentials validated, returns User profile & token.' },
        { code: 401, desc: 'Unauthorized: Invalid email or password.' }
      ]
    },
    {
      method: 'GET',
      path: '/api/leads',
      auth: 'Bearer Token Required',
      description: 'Fetch paginated and filterable leads list.',
      params: 'page (number), limit (number), status (NEW|CONTACTED|...|ALL), assignedTo (userId|UNASSIGNED|ALL), search (string), sortBy (createdAt|value|score), order (asc|desc)',
      curl: `curl -X GET "${window.location.origin}/api/leads?status=NEW&page=1&limit=10" \\
  -H "Authorization: Bearer token-admin-123"`,
      statuses: [
        { code: 200, desc: 'Returns PaginatedResponse<Lead> object with total & data array.' },
        { code: 401, desc: 'Unauthorized: Missing or invalid token.' }
      ]
    },
    {
      method: 'POST',
      path: '/api/leads/public',
      auth: 'Public (No Auth Token Required)',
      description: 'Public lead capture form endpoint for prospective buyers.',
      body: '{\n  "name": "Jane Prospect",\n  "email": "jane@acme.com",\n  "company": "Acme Corp",\n  "source": "Website",\n  "value": 45000\n}',
      curl: `curl -X POST "${window.location.origin}/api/leads/public" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Jane Prospect", "email": "jane@acme.com", "company": "Acme Corp", "value": 45000}'`,
      statuses: [
        { code: 201, desc: 'Lead captured successfully with default NEW status.' },
        { code: 400, desc: 'Bad Request: Missing name or email.' }
      ]
    },
    {
      method: 'PATCH',
      path: '/api/leads/:id',
      auth: 'Bearer Token Required',
      description: 'Update lead lifecycle stage, assignment, value, or details.',
      body: '{\n  "status": "QUALIFIED",\n  "assignedToId": "user-member-1"\n}',
      curl: `curl -X PATCH "${window.location.origin}/api/leads/lead-101" \\
  -H "Authorization: Bearer token-john-456" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "QUALIFIED"}'`,
      statuses: [
        { code: 200, desc: 'Returns updated Lead object and logs status change activity.' },
        { code: 404, desc: 'Lead not found.' }
      ]
    },
    {
      method: 'DELETE',
      path: '/api/leads/:id',
      auth: 'Admin Token Only',
      description: 'Permanently remove a lead record. Forbidden for Member role.',
      curl: `curl -X DELETE "${window.location.origin}/api/leads/lead-101" \\
  -H "Authorization: Bearer token-admin-123"`,
      statuses: [
        { code: 200, desc: 'Lead deleted successfully.' },
        { code: 403, desc: 'Forbidden: Admin role required for lead deletion.' },
        { code: 404, desc: 'Lead not found.' }
      ]
    },
    {
      method: 'POST',
      path: '/api/leads/:id/ai-analyze',
      auth: 'Bearer Token Required',
      description: 'Execute Gemini 3.6 Flash AI evaluation to generate score, summary, risk analysis, and outreach email.',
      curl: `curl -X POST "${window.location.origin}/api/leads/lead-101/ai-analyze" \\
  -H "Authorization: Bearer token-admin-123"`,
      statuses: [
        { code: 200, desc: 'Returns AIAnalysisResult with score, dealRisks, and draft email.' }
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Test Suite Runner Section */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
              <TestTube className="w-3.5 h-3.5" />
              <span>Automated Verification Suite</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Interactive Automated Test Runner</h2>
            <p className="text-xs text-slate-300 mt-1">
              Runs real-time integration tests against server endpoints covering public lead capture, pipeline status progression, and RBAC auth rules.
            </p>
          </div>

          <button
            onClick={handleExecuteSuite}
            disabled={runningTests}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{runningTests ? 'Running Automated Tests...' : 'Run Automated Test Suite'}</span>
          </button>
        </div>

        {/* Test Results Console */}
        {testResults && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Test Execution Report
              </span>
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {testSummary.passed} Passed
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${testSummary.failed > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                  {testSummary.failed} Failed
                </span>
                <span className="text-slate-400 font-mono">{testSummary.durationMs}ms</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {testResults.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-bold text-white">{t.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{t.durationMs}ms</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-normal pl-6">{t.details || t.error}</p>

                  <div className="pl-6 pt-1 flex items-center space-x-2 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                      Expected HTTP {t.expectedStatus}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                      Received HTTP {t.statusCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OpenAPI & REST API Documentation Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>OpenAPI v3 REST Specification</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">LeadFlow CRM JSON API Documentation</h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete specification of JSON API endpoints with pagination, filtering, search, and HTTP status codes.
          </p>
        </div>

        <div className="space-y-6">
          {API_ENDPOINTS.map((endpoint, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded font-black text-xs ${
                      endpoint.method === 'GET'
                        ? 'bg-blue-600 text-white'
                        : endpoint.method === 'POST'
                        ? 'bg-emerald-600 text-white'
                        : endpoint.method === 'PATCH'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{endpoint.path}</span>
                </div>

                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
                  {endpoint.auth}
                </span>
              </div>

              <p className="text-slate-700 font-medium">{endpoint.description}</p>

              {endpoint.params && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Query Parameters:</span>
                  <p className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-600">{endpoint.params}</p>
                </div>
              )}

              {/* Curl Command Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Sample cURL Command:</span>
                  <button
                    onClick={() => copyCurl(endpoint.curl, idx)}
                    className="flex items-center space-x-1 text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded text-slate-700 font-medium"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto">
                  {endpoint.curl}
                </pre>
              </div>

              {/* Status codes */}
              <div>
                <span className="font-bold text-slate-800 block mb-1">HTTP Response Status Codes:</span>
                <div className="space-y-1">
                  {endpoint.statuses.map((st, sIdx) => (
                    <div key={sIdx} className="flex items-center space-x-2 text-[11px]">
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${st.code < 300 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        HTTP {st.code}
                      </span>
                      <span className="text-slate-600">{st.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
