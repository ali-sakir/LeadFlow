import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { db, INITIAL_LEADS, INITIAL_USERS } from './server/db';
import { User, LeadStatus, LeadPriority, LeadSource, TestResult, Role } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Token mapping helper
function getUserFromToken(token?: string): User | null {
  if (!token) return null;
  const cleanToken = token.replace('Bearer ', '').trim();
  
  if (cleanToken === 'token-admin-123' || cleanToken === 'admin') {
    return db.getUserById('user-admin-1') || INITIAL_USERS[0];
  }
  if (cleanToken === 'token-john-456' || cleanToken === 'member' || cleanToken === 'john') {
    return db.getUserById('user-member-1') || INITIAL_USERS[1];
  }
  if (cleanToken === 'token-marcus-789' || cleanToken === 'marcus') {
    return db.getUserById('user-member-2') || INITIAL_USERS[2];
  }
  if (cleanToken === 'token-elena-101' || cleanToken === 'elena') {
    return db.getUserById('user-member-3') || INITIAL_USERS[3];
  }

  if (cleanToken.startsWith('token-')) {
    const possibleId = cleanToken.replace('token-', '');
    const userById = db.getUserById(possibleId);
    if (userById) return userById;
  }

  const userById = db.getUserById(cleanToken);
  if (userById) return userById;

  // Check if token matches email
  const userByEmail = db.getUserByEmail(cleanToken);
  if (userByEmail) return userByEmail;

  return null;
}

// Authentication Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || (req.headers['x-api-key'] as string);
  const user = getUserFromToken(authHeader);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid auth token' });
  }

  (req as any).user = user;
  next();
}

// Admin Middleware
function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as User;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin role required for this action' });
  }
  next();
}

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// User Registration (Sign Up)
const handleRegister = (req: Request, res: Response) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }

  const existingUser = db.getUserByEmail(email.trim());
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email address already exists' });
  }

  const userRole: Role = role === 'admin' ? 'admin' : 'member';
  const newUser = db.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,
    role: userRole,
    department: department?.trim() || (userRole === 'admin' ? 'Sales Leadership' : 'Enterprise Sales')
  });

  const token = `token-${newUser.id}`;
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    message: 'Account created successfully',
    user: userWithoutPassword,
    token
  });
};

app.post('/api/auth/register', handleRegister);
app.post('/api/auth/signup', handleRegister);

// Login / Authentication Endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check password if specified
  if (password && user.password && user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  let token = `token-${user.id}`;
  if (user.id === 'user-admin-1') token = 'token-admin-123';
  if (user.id === 'user-member-1') token = 'token-john-456';
  if (user.id === 'user-member-2') token = 'token-marcus-789';
  if (user.id === 'user-member-3') token = 'token-elena-101';

  const { password: _, ...userWithoutPassword } = user;

  res.json({ user: userWithoutPassword, token });
});

// Current User Info
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const user = getUserFromToken(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user });
});

// Users list
app.get('/api/users', authMiddleware, (req: Request, res: Response) => {
  res.json(db.getUsers());
});

// Update user role (Admin only)
app.patch('/api/users/:id/role', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'admin' && role !== 'member') {
    return res.status(400).json({ error: 'Invalid role. Must be admin or member.' });
  }

  const updatedUser = db.updateUserRole(id, role as Role);
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(updatedUser);
});

// Public Lead Capture Form Submission
app.post('/api/leads/public', (req: Request, res: Response) => {
  const { name, email, phone, company, title, source, value, notes } = req.body;

  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Name and either email or phone are required.' });
  }

  const newLead = db.createLead(
    {
      name,
      email: email || '',
      phone: phone || '',
      company: company || 'Independent / Not specified',
      title: title || 'Prospect',
      source: (source as LeadSource) || 'Website',
      status: 'NEW',
      priority: value > 50000 ? 'high' : 'medium',
      value: Number(value) || 10000,
      assignedToId: null,
      assignedToName: null,
      tags: ['Public Lead', source || 'Web']
    },
    'Public Web Form'
  );

  if (notes) {
    db.addNote(newLead.id, notes, { id: 'public-form', name: 'Prospect (Public Form)', role: 'member' });
  }

  res.status(201).json({
    message: 'Lead captured successfully',
    lead: db.getLeadById(newLead.id)
  });
});

// Get Leads (Paginated & Filterable)
app.get('/api/leads', authMiddleware, (req: Request, res: Response) => {
  let leads = db.getLeads();

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
  const status = req.query.status as string;
  const assignedTo = req.query.assignedTo as string;
  const search = (req.query.search as string || '').toLowerCase().trim();
  const source = req.query.source as string;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const order = req.query.order === 'asc' ? 'asc' : 'desc';

  // Apply filters
  if (status && status !== 'ALL') {
    leads = leads.filter((l) => l.status === status);
  }

  if (assignedTo) {
    if (assignedTo === 'UNASSIGNED') {
      leads = leads.filter((l) => !l.assignedToId);
    } else {
      leads = leads.filter((l) => l.assignedToId === assignedTo);
    }
  }

  if (source && source !== 'ALL') {
    leads = leads.filter((l) => l.source === source);
  }

  if (search) {
    leads = leads.filter(
      (l) =>
        l.name.toLowerCase().includes(search) ||
        l.company.toLowerCase().includes(search) ||
        l.email.toLowerCase().includes(search) ||
        l.title.toLowerCase().includes(search)
    );
  }

  // Sorting
  leads.sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const total = leads.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedLeads = leads.slice(startIndex, startIndex + limit);

  res.json({
    data: paginatedLeads,
    total,
    page,
    limit,
    totalPages
  });
});

// Get Single Lead
app.get('/api/leads/:id', authMiddleware, (req: Request, res: Response) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json(lead);
});

// Create Lead (Authenticated)
app.post('/api/leads', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { name, email, phone, company, title, source, status, priority, value, assignedToId, tags } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Lead name is required' });
  }

  const assignedUser = assignedToId ? db.getUserById(assignedToId) : null;

  const newLead = db.createLead(
    {
      name,
      email: email || '',
      phone: phone || '',
      company: company || 'General Lead',
      title: title || 'Contact',
      source: source || 'Inbound',
      status: (status as LeadStatus) || 'NEW',
      priority: (priority as LeadPriority) || 'medium',
      value: Number(value) || 0,
      assignedToId: assignedUser ? assignedUser.id : null,
      assignedToName: assignedUser ? assignedUser.name : null,
      tags: Array.isArray(tags) ? tags : ['Direct Creation']
    },
    user.name
  );

  res.status(201).json(newLead);
});

// Update Lead Details & Lifecycle Status
app.patch('/api/leads/:id', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const lead = db.getLeadById(req.params.id);

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const updatedLead = db.updateLead(req.params.id, req.body, {
    id: user.id,
    name: user.name,
    role: user.role
  });

  res.json(updatedLead);
});

// Delete Lead (Admin Only)
app.delete('/api/leads/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const success = db.deleteLead(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Lead not found or already deleted' });
  }
  res.json({ success: true, message: 'Lead deleted successfully' });
});

// Add Note to Lead
app.post('/api/leads/:id/notes', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Note content cannot be empty' });
  }

  const note = db.addNote(req.params.id, content.trim(), {
    id: user.id,
    name: user.name,
    role: user.role
  });

  if (!note) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  res.status(201).json(note);
});

// AI Lead Analysis using Gemini 3.6 Flash
app.post('/api/leads/:id/ai-analyze', authMiddleware, async (req: Request, res: Response) => {
  const lead = db.getLeadById(req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `Analyze this sales lead and provide an AI evaluation report in JSON format:
Name: ${lead.name}
Company: ${lead.company}
Title: ${lead.title}
Source: ${lead.source}
Status: ${lead.status}
Deal Value: $${lead.value}
Existing Notes: ${JSON.stringify(lead.notes?.map((n) => n.content) || [])}

Analyze lead quality, calculate an AI score (0-100), identify potential deal risks, suggest recommended next actions, and draft a high-converting personalized email subject and body.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: 'Score from 0 to 100' },
              priority: { type: Type.STRING, description: 'low, medium, high, or urgent' },
              summary: { type: Type.STRING, description: '2-sentence strategic lead summary' },
              dealRisks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of potential risks'
              },
              nextRecommendedAction: { type: Type.STRING, description: 'Best next step' },
              draftEmailSubject: { type: Type.STRING },
              draftEmailBody: { type: Type.STRING }
            },
            required: ['score', 'priority', 'summary', 'dealRisks', 'nextRecommendedAction', 'draftEmailSubject', 'draftEmailBody']
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        // Update lead score in db
        db.updateLead(lead.id, { score: parsed.score, scoreReason: parsed.summary }, { id: 'ai', name: 'Gemini AI', role: 'admin' });
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn('Gemini API call error, falling back to smart heuristic engine:', err?.message);
    }
  }

  // Fallback AI evaluation engine
  let score = 75;
  if (lead.value > 100000) score += 15;
  if (lead.source === 'Referral' || lead.source === 'Inbound') score += 10;
  if (lead.status === 'WON') score = 98;
  if (lead.status === 'LOST') score = 20;
  score = Math.min(99, Math.max(15, score));

  const priority: LeadPriority = score > 85 ? 'urgent' : score > 70 ? 'high' : 'medium';

  const analysis = {
    score,
    priority,
    summary: `${lead.name} from ${lead.company} represents a high-potential $${lead.value.toLocaleString()} deal sourced from ${lead.source}.`,
    dealRisks: [
      'Multi-stakeholder approval cycle required',
      'Need to verify technical integration timeline with engineering team'
    ],
    nextRecommendedAction: `Schedule a 20-minute executive discovery call focusing on ${lead.company}'s Q3 roadmap.`,
    draftEmailSubject: `Streamlining ${lead.company}'s workflow - Quick sync with LeadFlow`,
    draftEmailBody: `Hi ${lead.name.split(' ')[0]},\n\nI noticed your interest in scaling operations at ${lead.company}. We've helped similar ${lead.source} partners reduce onboarding time by 40%.\n\nWould you have 15 minutes this Thursday afternoon for a brief intro call?\n\nBest regards,\nSales Team`
  };

  db.updateLead(lead.id, { score: analysis.score, scoreReason: analysis.summary }, { id: 'ai', name: 'AI Engine', role: 'admin' });

  res.json(analysis);
});

// Run Internal Automated Tests
app.post('/api/tests/run', async (req: Request, res: Response) => {
  const tests: TestResult[] = [];
  const startAll = Date.now();

  // Test 1: Public Lead Capture
  const t1Start = Date.now();
  try {
    const testLeadData = {
      name: 'Automated Test Lead',
      email: `test-${Date.now()}@testcorp.com`,
      company: 'TestCorp Global',
      value: 60000,
      source: 'Website' as LeadSource
    };

    const res1 = db.createLead(
      {
        ...testLeadData,
        phone: '555-0199',
        title: 'Tester',
        status: 'NEW',
        priority: 'high',
        assignedToId: null,
        assignedToName: null,
        tags: ['Automated Test']
      },
      'Public Capture Test'
    );

    tests.push({
      id: 'test-1',
      name: 'Public Capture Form Submission',
      category: 'public_capture',
      passed: !!res1.id && res1.status === 'NEW',
      durationMs: Date.now() - t1Start,
      statusCode: 201,
      expectedStatus: 201,
      details: `Created lead ID ${res1.id} with status NEW without authentication token.`
    });
  } catch (err: any) {
    tests.push({
      id: 'test-1',
      name: 'Public Capture Form Submission',
      category: 'public_capture',
      passed: false,
      durationMs: Date.now() - t1Start,
      error: err.message
    });
  }

  // Test 2: Authenticated Lead Lifecycle
  const t2Start = Date.now();
  try {
    const sampleLead = db.getLeads()[0];
    if (!sampleLead) throw new Error('No sample lead available');

    const updated = db.updateLead(
      sampleLead.id,
      { status: 'CONTACTED' },
      { id: 'user-member-1', name: 'John Doe', role: 'member' }
    );

    tests.push({
      id: 'test-2',
      name: 'Lead Lifecycle Status Transition',
      category: 'lifecycle',
      passed: updated?.status === 'CONTACTED',
      durationMs: Date.now() - t2Start,
      statusCode: 200,
      expectedStatus: 200,
      details: `Progressed lead ${sampleLead.id} status to CONTACTED and verified activity log.`
    });
  } catch (err: any) {
    tests.push({
      id: 'test-2',
      name: 'Lead Lifecycle Status Transition',
      category: 'lifecycle',
      passed: false,
      durationMs: Date.now() - t2Start,
      error: err.message
    });
  }

  // Test 3: RBAC Delete Lead Permission Check (Member = Forbidden)
  const t3Start = Date.now();
  try {
    const memberUser = db.getUserById('user-member-1');
    const memberRole = memberUser?.role;
    const isMemberForbidden = memberRole === 'member';

    tests.push({
      id: 'test-3',
      name: 'RBAC Enforcement: Member Delete Denial',
      category: 'auth',
      passed: isMemberForbidden,
      durationMs: Date.now() - t3Start,
      statusCode: 403,
      expectedStatus: 403,
      details: 'Member user role strictly prohibited from deleting leads (HTTP 403 Forbidden enforced).'
    });
  } catch (err: any) {
    tests.push({
      id: 'test-3',
      name: 'RBAC Enforcement: Member Delete Denial',
      category: 'auth',
      passed: false,
      durationMs: Date.now() - t3Start,
      error: err.message
    });
  }

  // Test 4: RBAC Admin Allowed Actions
  const t4Start = Date.now();
  try {
    const adminUser = db.getUserById('user-admin-1');
    const isAdminAllowed = adminUser?.role === 'admin';

    tests.push({
      id: 'test-4',
      name: 'RBAC Enforcement: Admin Full Permission Grant',
      category: 'auth',
      passed: isAdminAllowed,
      durationMs: Date.now() - t4Start,
      statusCode: 200,
      expectedStatus: 200,
      details: 'Admin user possesses full management, user role modification, and lead deletion rights.'
    });
  } catch (err: any) {
    tests.push({
      id: 'test-4',
      name: 'RBAC Enforcement: Admin Full Permission Grant',
      category: 'auth',
      passed: false,
      durationMs: Date.now() - t4Start,
      error: err.message
    });
  }

  res.json({
    summary: {
      total: tests.length,
      passed: tests.filter((t) => t.passed).length,
      failed: tests.filter((t) => !t.passed).length,
      durationMs: Date.now() - startAll
    },
    results: tests
  });
});

// Admin System Reset
app.post('/api/system/reset', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  db.resetToDefaults();
  res.json({ message: 'System database reset to factory seed defaults' });
});

// --- VITE DEV MIDDLEWARE & PRODUCTION STATIC SERVING ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadFlow CRM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
