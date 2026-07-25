import fs from 'fs';
import path from 'path';
import { ActivityLog, Lead, Note, User } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Sarah Connor',
    email: 'admin@company.com',
    password: 'password123',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'Sales Management',
    active: true
  },
  {
    id: 'user-member-1',
    name: 'John Doe',
    email: 'john@company.com',
    password: 'password123',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Enterprise Sales',
    active: true
  },
  {
    id: 'user-member-2',
    name: 'Marcus Vance',
    email: 'marcus@company.com',
    password: 'password123',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Mid-Market Sales',
    active: true
  },
  {
    id: 'user-member-3',
    name: 'Elena Rostova',
    email: 'elena@company.com',
    password: 'password123',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    department: 'Inbound Growth',
    active: true
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@nexusinnovations.com',
    phone: '+1 (555) 234-5678',
    company: 'Nexus Innovations',
    title: 'Chief Technology Officer',
    source: 'Website',
    status: 'NEW',
    priority: 'high',
    value: 45000,
    score: 82,
    scoreReason: 'High engagement on product demo request and technical specification download.',
    assignedToId: 'user-member-1',
    assignedToName: 'John Doe',
    tags: ['SaaS', 'Cloud', 'High Intent'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    notes: [
      {
        id: 'note-1',
        leadId: 'lead-101',
        authorId: 'user-admin-1',
        authorName: 'Sarah Connor',
        authorRole: 'admin',
        content: 'Submitted contact form requesting custom API deployment quotes.',
        createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
      }
    ],
    activities: [
      {
        id: 'act-1',
        leadId: 'lead-101',
        actorId: 'system',
        actorName: 'Public Web Form',
        type: 'created',
        description: 'Lead captured via Public Web Capture Form',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
      },
      {
        id: 'act-2',
        leadId: 'lead-101',
        actorId: 'user-admin-1',
        actorName: 'Sarah Connor',
        type: 'assignment_change',
        description: 'Assigned lead to John Doe',
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString()
      }
    ]
  },
  {
    id: 'lead-102',
    name: 'Samantha Lee',
    email: 'slee@apexlogistics.io',
    phone: '+1 (555) 876-5432',
    company: 'Apex Logistics Global',
    title: 'VP of Operations',
    source: 'Inbound',
    status: 'CONTACTED',
    priority: 'urgent',
    value: 85000,
    score: 91,
    scoreReason: 'Urgent timeline for Q3 deployment across 12 distribution hubs.',
    assignedToId: 'user-member-2',
    assignedToName: 'Marcus Vance',
    tags: ['Logistics', 'Enterprise', 'Urgent'],
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: [
      {
        id: 'note-2',
        leadId: 'lead-102',
        authorId: 'user-member-2',
        authorName: 'Marcus Vance',
        authorRole: 'member',
        content: 'Initial discovery call went great. She requested a follow-up call with security engineers next Tuesday.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ],
    activities: [
      {
        id: 'act-3',
        leadId: 'lead-102',
        actorId: 'system',
        actorName: 'Inbound Portal',
        type: 'created',
        description: 'Lead created via Inbound Webhook',
        timestamp: new Date(Date.now() - 3600000 * 96).toISOString()
      },
      {
        id: 'act-4',
        leadId: 'lead-102',
        actorId: 'user-member-2',
        actorName: 'Marcus Vance',
        type: 'status_change',
        description: 'Status changed from NEW to CONTACTED',
        timestamp: new Date(Date.now() - 3600000 * 30).toISOString()
      }
    ]
  },
  {
    id: 'lead-103',
    name: 'David Miller',
    email: 'd.miller@cloudscale.net',
    phone: '+1 (555) 345-6789',
    company: 'CloudScale Inc',
    title: 'Director of IT Architecture',
    source: 'Referral',
    status: 'QUALIFIED',
    priority: 'high',
    value: 120000,
    score: 88,
    scoreReason: 'Referred by key partner. Verified budget and decision-making timeline.',
    assignedToId: 'user-admin-1',
    assignedToName: 'Sarah Connor',
    tags: ['FinTech', 'Referral', 'Enterprise'],
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    notes: [
      {
        id: 'note-3',
        leadId: 'lead-103',
        authorId: 'user-admin-1',
        authorName: 'Sarah Connor',
        authorRole: 'admin',
        content: 'Budget confirmed at $120k ARR. Procurement review initiated.',
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ],
    activities: [
      {
        id: 'act-5',
        leadId: 'lead-103',
        actorId: 'user-admin-1',
        actorName: 'Sarah Connor',
        type: 'created',
        description: 'Lead created manually',
        timestamp: new Date(Date.now() - 3600000 * 120).toISOString()
      },
      {
        id: 'act-6',
        leadId: 'lead-103',
        actorId: 'user-admin-1',
        actorName: 'Sarah Connor',
        type: 'status_change',
        description: 'Status updated to QUALIFIED',
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ]
  },
  {
    id: 'lead-104',
    name: 'Rachel Green',
    email: 'rachel@horizonfintech.com',
    phone: '+1 (555) 901-2345',
    company: 'Horizon FinTech',
    title: 'Head of Growth Strategy',
    source: 'Event',
    status: 'PROPOSAL_SENT',
    priority: 'medium',
    value: 65000,
    score: 79,
    scoreReason: 'Proposal delivered on May 14th. Waiting on internal stakeholder signoff.',
    assignedToId: 'user-member-1',
    assignedToName: 'John Doe',
    tags: ['FinTech', 'Proposal Out'],
    createdAt: new Date(Date.now() - 3600000 * 200).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    notes: [
      {
        id: 'note-4',
        leadId: 'lead-104',
        authorId: 'user-member-1',
        authorName: 'John Doe',
        authorRole: 'member',
        content: 'Emailed customized proposal PDF to Rachel and CFO.',
        createdAt: new Date(Date.now() - 3600000 * 15).toISOString()
      }
    ],
    activities: [
      {
        id: 'act-7',
        leadId: 'lead-104',
        actorId: 'user-member-1',
        actorName: 'John Doe',
        type: 'status_change',
        description: 'Status changed to PROPOSAL_SENT',
        timestamp: new Date(Date.now() - 3600000 * 15).toISOString()
      }
    ]
  },
  {
    id: 'lead-105',
    name: 'Michael Scott',
    email: 'm.scott@dunderpaper.com',
    phone: '+1 (555) 432-1098',
    company: 'Dunder Paper Co',
    title: 'Regional Manager',
    source: 'Cold Outreach',
    status: 'WON',
    priority: 'medium',
    value: 38000,
    score: 95,
    scoreReason: 'Signed annual enterprise contract on Friday.',
    assignedToId: 'user-member-3',
    assignedToName: 'Elena Rostova',
    tags: ['Paper & Retail', 'Closed Won'],
    createdAt: new Date(Date.now() - 3600000 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: [
      {
        id: 'note-5',
        leadId: 'lead-105',
        authorId: 'user-member-3',
        authorName: 'Elena Rostova',
        authorRole: 'member',
        content: 'Deal closed! Contract executed for 1-year prepaid plan.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    activities: [
      {
        id: 'act-8',
        leadId: 'lead-105',
        actorId: 'user-member-3',
        actorName: 'Elena Rostova',
        type: 'status_change',
        description: 'Closed Deal! Status moved to WON',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ]
  },
  {
    id: 'lead-106',
    name: 'Carlos Mendez',
    email: 'carlos.m@quantix.io',
    phone: '+1 (555) 678-9012',
    company: 'Quantix Systems',
    title: 'Lead Software Architect',
    source: 'Website',
    status: 'NEW',
    priority: 'medium',
    value: 30000,
    score: 65,
    scoreReason: 'Unassigned public lead submission.',
    assignedToId: null,
    assignedToName: null,
    tags: ['Inbound', 'Unassigned'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: [],
    activities: [
      {
        id: 'act-9',
        leadId: 'lead-106',
        actorId: 'system',
        actorName: 'Public Web Form',
        type: 'created',
        description: 'Lead captured via Public Capture Form',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  }
];

export interface DatabaseSchema {
  users: User[];
  leads: Lead[];
}

export class DataStore {
  private users: User[] = [];
  private leads: Lead[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data: DatabaseSchema = JSON.parse(raw);
        this.users = data.users || INITIAL_USERS;
        this.leads = data.leads || INITIAL_LEADS;
      } else {
        this.resetToDefaults();
      }
    } catch (err) {
      console.error('Error loading db.json, resetting to defaults:', err);
      this.resetToDefaults();
    }
  }

  public resetToDefaults() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.leads = JSON.parse(JSON.stringify(INITIAL_LEADS));
    this.persist();
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: this.users, leads: this.leads }, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist db.json:', err);
    }
  }

  // User operations
  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'member';
    department?: string;
    avatarUrl?: string;
  }): User {
    const id = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    ];
    const defaultAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newUser: User = {
      id,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      avatarUrl: userData.avatarUrl || defaultAvatar,
      department: userData.department || 'Sales Operations',
      active: true
    };

    this.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUserRole(userId: string, role: 'admin' | 'member'): User | undefined {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.role = role;
      this.persist();
    }
    return user;
  }

  // Lead operations
  public getLeads(): Lead[] {
    return this.leads;
  }

  public getLeadById(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  public createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'activities'>, actorName = 'System'): Lead {
    const id = `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const newLead: Lead = {
      ...leadData,
      id,
      score: leadData.score || Math.floor(Math.random() * 30) + 60,
      scoreReason: leadData.scoreReason || 'Automated score based on source & initial value.',
      createdAt: now,
      updatedAt: now,
      notes: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          leadId: id,
          actorId: 'system',
          actorName,
          type: 'created',
          description: `Lead created (${leadData.source})`,
          timestamp: now
        }
      ]
    };

    this.leads.unshift(newLead);
    this.persist();
    return newLead;
  }

  public updateLead(
    id: string,
    updates: Partial<Omit<Lead, 'id' | 'createdAt' | 'activities' | 'notes'>>,
    actor: { id: string; name: string; role: string }
  ): Lead | undefined {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return undefined;

    const now = new Date().toISOString();
    const oldStatus = lead.status;
    const oldAssignedTo = lead.assignedToId;

    Object.assign(lead, updates);
    lead.updatedAt = now;

    if (!lead.activities) lead.activities = [];

    // Log status change activity
    if (updates.status && updates.status !== oldStatus) {
      lead.activities.unshift({
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        leadId: lead.id,
        actorId: actor.id,
        actorName: actor.name,
        type: 'status_change',
        description: `Status changed from ${oldStatus} to ${updates.status}`,
        timestamp: now
      });
    }

    // Log assignment change activity
    if (updates.assignedToId !== undefined && updates.assignedToId !== oldAssignedTo) {
      const assignedUser = updates.assignedToId ? this.getUserById(updates.assignedToId) : null;
      lead.assignedToName = assignedUser ? assignedUser.name : null;
      
      lead.activities.unshift({
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        leadId: lead.id,
        actorId: actor.id,
        actorName: actor.name,
        type: 'assignment_change',
        description: assignedUser ? `Reassigned lead to ${assignedUser.name}` : `Unassigned lead`,
        timestamp: now
      });
    }

    this.persist();
    return lead;
  }

  public deleteLead(id: string): boolean {
    const index = this.leads.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.leads.splice(index, 1);
      this.persist();
      return true;
    }
    return false;
  }

  public addNote(
    leadId: string,
    content: string,
    author: { id: string; name: string; role: 'admin' | 'member' }
  ): Note | undefined {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return undefined;

    const now = new Date().toISOString();
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content,
      createdAt: now
    };

    if (!lead.notes) lead.notes = [];
    lead.notes.unshift(newNote);
    lead.updatedAt = now;

    if (!lead.activities) lead.activities = [];
    lead.activities.unshift({
      id: `act-${Date.now()}`,
      leadId,
      actorId: author.id,
      actorName: author.name,
      type: 'note_added',
      description: `Added a internal note`,
      timestamp: now
    });

    this.persist();
    return newNote;
  }
}

export const db = new DataStore();
