import { strict as assert } from 'node:assert';
import { test, describe, before, after } from 'node:test';

let serverInstance = null;
let BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const ADMIN_TOKEN = 'token-admin-123';
const MEMBER_TOKEN = 'token-john-456';

describe('Lead Management CRM API Suite', () => {
  let createdPublicLeadId = '';

  before(async () => {
    // Check if server is reachable; if not, spin up server inline for standalone node test
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch (e) {
      // Server not running, spin up server
      const { app } = await import('../server.ts');
      const PORT = 3009;
      BASE_URL = `http://localhost:${PORT}`;
      await new Promise((resolve) => {
        serverInstance = app.listen(PORT, '0.0.0.0', () => {
          resolve(true);
        });
      });
    }
  });

  after(() => {
    if (serverInstance) {
      serverInstance.close();
    }
  });

  describe('Core Flow 0: Real User Authentication (Signup & Login)', () => {
    const testUser = {
      name: 'Test Sales Rep',
      email: `rep-${Date.now()}@testcompany.com`,
      password: 'password123',
      role: 'member',
      department: 'Enterprise Sales'
    };

    test('allows new member to register (signup) an account', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      assert.equal(res.status, 201, 'Signup should return HTTP 201 Created');
      const body = await res.json();
      assert.ok(body.token, 'Response should include auth token');
      assert.equal(body.user.email, testUser.email);
      assert.equal(body.user.role, 'member');
    });

    test('prevents registering duplicate email address', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      assert.equal(res.status, 409, 'Duplicate email should return HTTP 409 Conflict');
    });

    test('authenticates registered user via login endpoint with correct password', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      assert.equal(res.status, 200, 'Login with valid credentials should return HTTP 200 OK');
      const body = await res.json();
      assert.ok(body.token, 'Login response should contain token');
      assert.equal(body.user.name, testUser.name);
    });

    test('rejects login with invalid password', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'wrongpassword'
        })
      });

      assert.equal(res.status, 401, 'Invalid password should return HTTP 401 Unauthorized');
    });
  });

  describe('Core Flow 1: Public Lead Capture Form Submission', () => {
    test('allows unauthenticated prospective leads to submit public capture form', async () => {
      const leadData = {
        name: 'Test Prospect',
        email: 'test.prospect@acme-corp.com',
        phone: '+1 (555) 999-0000',
        company: 'Acme Test Corp',
        title: 'VP Engineering',
        source: 'Website',
        value: 50000,
        notes: 'Interested in enterprise custom plan and API integrations.'
      };

      const res = await fetch(`${BASE_URL}/api/leads/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      assert.equal(res.status, 201, 'Public capture form should return HTTP 201 Created');
      const body = await res.json();
      assert.ok(body.lead, 'Response should contain created lead object');
      assert.equal(body.lead.status, 'NEW', 'Captured lead should default to NEW status');
      assert.ok(body.lead.id, 'Lead should have auto-generated ID');

      createdPublicLeadId = body.lead.id;
    });

    test('validates required fields on public lead capture form', async () => {
      const invalidLead = {
        name: '',
        email: 'invalid-email'
      };

      const res = await fetch(`${BASE_URL}/api/leads/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidLead)
      });

      assert.equal(res.status, 400, 'Missing required fields should return HTTP 400 Bad Request');
      const body = await res.json();
      assert.ok(body.error, 'Should return explicit error message');
    });
  });

  describe('Core Flow 2: Authenticated Lead Lifecycle & Pipeline Progression', () => {
    test('authenticated user can query paginated leads with status filter', async () => {
      const res = await fetch(`${BASE_URL}/api/leads?status=NEW&limit=10`, {
        headers: { Authorization: `Bearer ${MEMBER_TOKEN}` }
      });

      assert.equal(res.status, 200, 'GET /api/leads should return HTTP 200 OK');
      const body = await res.json();
      assert.ok(Array.isArray(body.data), 'Response data should be an array of leads');
      assert.ok(body.total >= 1, 'Total lead count should be at least 1');
      assert.equal(body.page, 1, 'Page should be 1');
    });

    test('sales member can progress lead status from NEW to CONTACTED to QUALIFIED', async () => {
      assert.ok(createdPublicLeadId, 'Pre-requisite lead ID must exist');

      // 1. Move to CONTACTED
      const res1 = await fetch(`${BASE_URL}/api/leads/${createdPublicLeadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MEMBER_TOKEN}`
        },
        body: JSON.stringify({ status: 'CONTACTED' })
      });

      assert.equal(res1.status, 200, 'Status update to CONTACTED should return 200');
      const lead1 = await res1.json();
      assert.equal(lead1.status, 'CONTACTED');

      // 2. Add discovery Note
      const resNote = await fetch(`${BASE_URL}/api/leads/${createdPublicLeadId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MEMBER_TOKEN}`
        },
        body: JSON.stringify({ content: 'Held discovery call. Client budget confirmed.' })
      });

      assert.equal(resNote.status, 201, 'Adding note should return 201 Created');
      const noteBody = await resNote.json();
      assert.equal(noteBody.content, 'Held discovery call. Client budget confirmed.');

      // 3. Move to QUALIFIED
      const res2 = await fetch(`${BASE_URL}/api/leads/${createdPublicLeadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MEMBER_TOKEN}`
        },
        body: JSON.stringify({ status: 'QUALIFIED', value: 75000 })
      });

      assert.equal(res2.status, 200, 'Status update to QUALIFIED should return 200');
      const lead2 = await res2.json();
      assert.equal(lead2.status, 'QUALIFIED');
      assert.equal(lead2.value, 75000);
    });
  });

  describe('Auth & RBAC Permission Enforcement', () => {
    test('prevents unauthenticated access to protected endpoint', async () => {
      const res = await fetch(`${BASE_URL}/api/leads/lead-101`);
      assert.equal(res.status, 401, 'Unauthenticated request should return HTTP 401 Unauthorized');
    });

    test('prevents non-admin member from deleting a lead (403 Forbidden)', async () => {
      assert.ok(createdPublicLeadId, 'Pre-requisite lead ID must exist');

      const res = await fetch(`${BASE_URL}/api/leads/${createdPublicLeadId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${MEMBER_TOKEN}` }
      });

      assert.equal(res.status, 403, 'Member role should receive HTTP 403 Forbidden on DELETE lead');
      const body = await res.json();
      assert.ok(body.error.includes('Admin'), 'Error should specify Admin privilege required');
    });

    test('allows admin role to delete a lead (200 OK)', async () => {
      assert.ok(createdPublicLeadId, 'Pre-requisite lead ID must exist');

      const res = await fetch(`${BASE_URL}/api/leads/${createdPublicLeadId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
      });

      assert.equal(res.status, 200, 'Admin role should be allowed to delete a lead');
      const body = await res.json();
      assert.equal(body.success, true);
    });

    test('prevents member from changing user roles', async () => {
      const res = await fetch(`${BASE_URL}/api/users/user-member-1/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MEMBER_TOKEN}`
        },
        body: JSON.stringify({ role: 'admin' })
      });

      assert.equal(res.status, 403, 'Member trying to change role should receive HTTP 403 Forbidden');
    });
  });
});
