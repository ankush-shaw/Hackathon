import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import { guidelinesRouter } from '../server/src/routes/guidelines.js';
import { reviewsRouter } from '../server/src/routes/reviews.js';
import { evidenceRouter } from '../server/src/routes/evidence.js';
import { campaignRouter } from '../server/src/routes/campaigns.js';
import { authRouter } from '../server/src/routes/analytics.js';
import { authenticate } from '../server/src/middleware/auth.js';
import { DbStore } from '../server/src/services/dbStore.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(authenticate);

app.use('/api/auth', authRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api/guidelines', guidelinesRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/reviews', reviewsRouter);

function makeToken(userObj) {
  return Buffer.from(JSON.stringify(userObj)).toString('base64');
}

async function run() {
  await DbStore.initialize();
  const server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`Auth/RBAC Verification Server running on port ${port}`);

  const testCampaignId = `CAMP-AUTH-${Date.now()}`;
  DbStore.saveCampaign({
    id: testCampaignId,
    campaignName: 'Auth Matrix Test Campaign',
    targetChannel: 'Web',
    content: 'We provide 99.99% uptime availability.',
    activePolicyVersion: 'v2.4',
    status: 'In Review',
    brandHealthScore: 85,
    findings: [{
      id: 'FINDING-01',
      originalClaim: '99.99% uptime',
      matchedText: '99.99% uptime availability',
      ruleCode: 'Policy 4.2',
      category: 'tone_sla',
      severity: 'warning',
      status: 'flagged'
    }],
    versions: [],
    currentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasCreativeAsset: false,
    auditLog: []
  });

  const encodedId = encodeURIComponent(testCampaignId);

  console.log('\n--- PART A: TOKEN & CREDENTIAL VALIDATION ---');

  // A1: Missing Token
  const resMissing = await fetch(`${baseUrl}/api/reviews/${encodedId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision: 'Approved', reason: 'Test' })
  });
  console.log(`[A1] Missing Token: HTTP ${resMissing.status} (Expected: 401)`);

  // A2: Forged / Invalid base64 token
  const resForged = await fetch(`${baseUrl}/api/reviews/${encodedId}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer NOT_VALID_BASE64_!!!'
    },
    body: JSON.stringify({ decision: 'Approved', reason: 'Test' })
  });
  console.log(`[A2] Forged/Invalid Base64 Token: HTTP ${resForged.status} (Expected: 401)`);

  // A3: Token with empty/invalid payload
  const resEmptyPayload = await fetch(`${baseUrl}/api/reviews/${encodedId}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Buffer.from('{}').toString('base64')}`
    },
    body: JSON.stringify({ decision: 'Approved', reason: 'Test' })
  });
  console.log(`[A3] Empty Payload Token: HTTP ${resEmptyPayload.status} (Expected: 401)`);

  // A4: Non-Bearer auth header
  const resBasicAuth = await fetch(`${baseUrl}/api/reviews/${encodedId}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic dXNlcjpwYXNz'
    },
    body: JSON.stringify({ decision: 'Approved', reason: 'Test' })
  });
  console.log(`[A4] Non-Bearer Auth Header: HTTP ${resBasicAuth.status} (Expected: 401)`);

  console.log('\n--- PART B: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX ---');
  const roles = [
    { role: 'Brand Marketing Lead', shouldPass: true },
    { role: 'Compliance & Legal Counsel', shouldPass: true },
    { role: 'Admin', shouldPass: true },
    { role: 'Creative Director / Copywriter', shouldPass: false },
    { role: 'Growth Marketing Director', shouldPass: false },
    { role: 'Product Marketing Manager', shouldPass: false }
  ];

  for (const r of roles) {
    const token = makeToken({
      name: `Test ${r.role}`,
      email: `test@company.com`,
      role: r.role,
      company: 'Acme Global Corp'
    });

    // 1. Test POST decision
    const resDec = await fetch(`${baseUrl}/api/reviews/${encodedId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ decision: 'Approved', reason: `Decision by ${r.role}` })
    });

    // 2. Test POST override
    const resOvr = await fetch(`${baseUrl}/api/reviews/${encodedId}/override`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ findingId: 'FINDING-01', reason: `Override by ${r.role}` })
    });

    // 3. Test POST guideline
    const resRule = await fetch(`${baseUrl}/api/guidelines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title: `Rule by ${r.role}`, matchPattern: 'test_pat' })
    });

    const decPass = r.shouldPass ? resDec.status === 200 : resDec.status === 403;
    const ovrPass = r.shouldPass ? resOvr.status === 200 : resOvr.status === 403;
    const rulePass = r.shouldPass ? resRule.status === 201 : resRule.status === 403;

    console.log(`Role: [${r.role.padEnd(30)}] | Decision: HTTP ${resDec.status} | Override: HTTP ${resOvr.status} | Rule Create: HTTP ${resRule.status} | Result: ${decPass && ovrPass && rulePass ? '✅ PASS' : '❌ FAIL'}`);

    if (r.shouldPass && resRule.status === 201) {
      const created = await resRule.json();
      // Clean up guideline
      await fetch(`${baseUrl}/api/guidelines/${created.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  }

  // Clean up
  DbStore.deleteCampaign(testCampaignId);
  server.close();
  console.log('\n=== AUTH & RBAC MATRIX TEST COMPLETE ===');
}

run().catch(console.error);

