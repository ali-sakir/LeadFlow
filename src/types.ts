export type Role = 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  department: string;
  active: boolean;
  password?: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST';

export type LeadSource = 'Website' | 'Inbound' | 'Referral' | 'Social' | 'Event' | 'Cold Outreach' | 'Partner';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Note {
  id: string;
  leadId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
}

export type ActivityType = 
  | 'created' 
  | 'status_change' 
  | 'assignment_change' 
  | 'note_added' 
  | 'call_logged' 
  | 'email_sent' 
  | 'meeting_scheduled' 
  | 'ai_scored';

export interface ActivityLog {
  id: string;
  leadId: string;
  actorId: string;
  actorName: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  value: number;
  score?: number;
  scoreReason?: string;
  assignedToId: string | null;
  assignedToName: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
  activities?: ActivityLog[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  assignedTo?: string;
  search?: string;
  source?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TestResult {
  id: string;
  name: string;
  category: 'auth' | 'lifecycle' | 'public_capture' | 'api_contracts';
  passed: boolean;
  durationMs: number;
  statusCode?: number;
  expectedStatus?: number;
  error?: string;
  details?: string;
}

export interface AIAnalysisResult {
  score: number;
  priority: LeadPriority;
  summary: string;
  dealRisks: string[];
  nextRecommendedAction: string;
  draftEmailSubject: string;
  draftEmailBody: string;
}
