# LeadFlow CRM - Enterprise Sales Lead Management Application

A full-stack sales lead management application built with **React**, **TypeScript**, **Tailwind CSS**, **Express.js**, and **Google Gemini 3.6 Flash AI**.

Designed for small sales teams to capture inbound leads, manage deal lifecycles across pipeline stages, enforce role-based access control (RBAC) permissions, and utilize AI for lead scoring and personalized outreach email generation.

---

## Key Features

### 1. Public Lead Capture Form Portal
- **Endpoint**: `POST /api/leads/public` (Unauthenticated)
- Allows prospective customers to submit sales inquiries.
- Automatically assigns status `NEW`, calculates initial score, and creates an audit trail entry.
- Includes embedded HTML/JS widget snippet generation and shareable portal URL.

### 2. Role-Based Access Control (RBAC)
- **Roles**: `Admin` (e.g., Sarah Connor) and `Member` (e.g., John Reese, Marcus Wright, Elena Rostova).
- Client-side and server-side authorization enforcement.
- **Member Permissions**: View pipeline, move lead stages, reassign leads, post internal team notes.
- **Admin Permissions**: All member capabilities **PLUS** deleting lead records and modifying team member roles.
- Role switching dropdown directly in the top header bar for fast testing of permissions.

### 3. Lead Lifecycle & Pipeline Progression
- **Interactive Kanban Board**: Visual Drag-and-Drop / Stage Selector (`NEW` ➔ `CONTACTED` ➔ `QUALIFIED` ➔ `PROPOSAL_SENT` ➔ `WON` / `LOST`).
- **Data Table View**: Rich filtering by stage, assigned representative, text search, sorting, and pagination controls.
- **Activity Trail & History**: Complete chronological log tracking status changes, reassignments, notes, and form submissions.
- **Team Notes**: Timestamped internal notes with author badges.

### 4. Gemini 3.6 Flash AI Lead Intelligence
- **Endpoint**: `POST /api/leads/:id/ai-analyze`
- Evaluates lead quality to produce a score (0–100), deal risks, priority level, conversion probability, and drafts a personalized outreach email for sales representatives.

---

## REST JSON API Specification

All protected endpoints require an `Authorization` header formatted as:
`Authorization: Bearer <token>`

### 1. Get Paginated & Filtered Leads
- **GET** `/api/leads`
- **Headers**: `Authorization: Bearer token-admin-123`
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `status` (`NEW` | `CONTACTED` | `QUALIFIED` | `PROPOSAL_SENT` | `WON` | `LOST` | `ALL`)
  - `assignedTo` (`<userId>` | `UNASSIGNED` | `ALL`)
  - `search` (Search term matching name, email, company, or title)
  - `sortBy` (`createdAt` | `value` | `score` | `name`)
  - `order` (`asc` | `desc`)
- **Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "lead-101",
        "name": "Alex Mercer",
        "email": "alex@apextech.io",
        "company": "Apex Technologies",
        "title": "CTO",
        "status": "QUALIFIED",
        "value": 85000,
        "score": 88,
        "assignedToId": "user-member-1"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
  ```

### 2. Public Lead Capture Form
- **POST** `/api/leads/public`
- **Request Body**:
  ```json
  {
    "name": "Eleanor Vance",
    "email": "eleanor@vancetech.com",
    "company": "Vance Technologies",
    "title": "Director of Operations",
    "phone": "+1 (555) 000-1111",
    "source": "Website",
    "value": 50000,
    "notes": "Looking for custom integration and enterprise SLA."
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "lead": { "id": "lead-172189...", "status": "NEW" }
  }
  ```

### 3. Update Lead Status / Details
- **PATCH** `/api/leads/:id`
- **Headers**: `Authorization: Bearer token-john-456`
- **Request Body**:
  ```json
  {
    "status": "PROPOSAL_SENT",
    "assignedToId": "user-member-2",
    "value": 90000
  }
  ```
- **Response** (`200 OK`)

### 4. Delete Lead Record (Admin Only)
- **DELETE** `/api/leads/:id`
- **Headers**: `Authorization: Bearer token-admin-123`
- **Response**: `200 OK` (Admin) or `403 Forbidden` (Member)

---

## Automated Test Suite

LeadFlow includes an automated integration test suite written with Node.js test runner (`node --test`).

### Covered Scenarios:
1. **Public Lead Capture**: Unauthenticated submission and required field validation.
2. **Authenticated Pipeline Flow**: Pagination, status filtering, stage progression (`NEW` ➔ `CONTACTED` ➔ `QUALIFIED`), and note additions.
3. **Auth & RBAC Enforcement**: Unauthenticated request blocking (`401`), non-admin deletion blocking (`403`), admin deletion execution (`200`), and role change restriction (`403`).

### Run Automated Tests:
```bash
npm test
```

---

## Free-Tier Deployment Guide

LeadFlow CRM is designed to build into a standalone single-file backend bundle (`dist/server.cjs`) served via Node.js.

### Deployment Options:
1. **Google Cloud Run (Free Tier)**:
   - Command: `gcloud run deploy leadflow-crm --source .`
   - Set environment variable `GEMINI_API_KEY`.
2. **Render / Render Free Tier**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. **Vercel / Railway / Fly.io**:
   - Standard Node.js runtime targeting `dist/server.cjs`.
