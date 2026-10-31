import dotenv from 'dotenv';
import { DbStore } from '../server/src/services/dbStore.js';

dotenv.config();

async function run() {
  console.log('--- STEP 1: INITIALIZE DB STORE & CHECK STATUS ---');
  await DbStore.initialize();
  const status = await DbStore.getDatabaseStatus();
  console.log('Database Status:', JSON.stringify(status, null, 2));

  console.log('\n--- STEP 2: SUPABASE / DB STORE SELECT ---');
  const initialRules = DbStore.getRules();
  console.log(`Initial guidelines count: ${initialRules.length}`);
  const initialEvidence = DbStore.getEvidence();
  console.log(`Initial evidence count: ${initialEvidence.length}`);

  console.log('\n--- STEP 3: INSERT NEW GUIDELINE RULE ---');
  const testRuleId = `RULE-VERIF-${Date.now()}`;
  const testRule = {
    id: testRuleId,
    code: 'POL-VERIF-01',
    title: 'Verification Test Policy',
    category: 'prohibited',
    categoryLabel: 'Prohibited Test Term',
    severity: 'critical',
    description: 'Temporary test guideline for zero-trust CRUD verification',
    matchPattern: 'strictly unverified test term',
    isRegex: false,
    clarificationNote: 'Used only for testing',
    suggestedReplacement: 'verified term',
    evidenceRequired: false,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const inserted = DbStore.addRule(testRule);
  console.log('Inserted Rule ID:', inserted.id);

  console.log('\n--- STEP 4: VERIFY INSERTION VIA SELECT ---');
  const foundAfterInsert = DbStore.getRules().find(r => r.id === testRuleId);
  console.log('Found inserted rule:', !!foundAfterInsert, foundAfterInsert?.code);

  console.log('\n--- STEP 5: UPDATE GUIDELINE RULE ---');
  const updated = DbStore.updateRule(testRuleId, {
    description: 'UPDATED: Description verified through live test',
    suggestedReplacement: 'super-verified replacement'
  });
  console.log('Updated Rule description:', updated?.description);

  console.log('\n--- STEP 6: VERIFY PERSISTENCE AFTER UPDATE ---');
  const foundAfterUpdate = DbStore.getRules().find(r => r.id === testRuleId);
  console.log('Found after update:', foundAfterUpdate?.description === 'UPDATED: Description verified through live test');

  console.log('\n--- STEP 7: DELETE GUIDELINE RULE ---');
  const deleted = DbStore.deleteRule(testRuleId);
  console.log('Delete operation result:', deleted);

  const foundAfterDelete = DbStore.getRules().find(r => r.id === testRuleId);
  console.log('Found after delete (should be undefined):', foundAfterDelete);

  console.log('\n--- STEP 8: EVIDENCE CRUD TEST ---');
  const testEvidenceId = `EVID-VERIF-${Date.now()}`;
  const testEvidence = {
    id: testEvidenceId,
    code: 'EVID-TEST-99',
    title: 'Zero-Trust Audit Benchmark 2026',
    claimOrFact: 'Audited benchmark verifies 99.999% reliability under stress.',
    sourceReference: 'Zero-Trust Engineering Whitepaper #99',
    category: 'Performance Benchmark',
    verificationStatus: 'verified',
    notes: 'Created for CRUD verification',
    validFrom: '2026-01-01',
    expirationDate: '2027-01-01',
    createdAt: new Date().toISOString()
  };

  const insertedEvid = DbStore.addEvidence(testEvidence);
  console.log('Inserted Evidence Code:', insertedEvid.code);

  const updatedEvid = DbStore.updateEvidence(testEvidenceId, {
    notes: 'UPDATED EVIDENCE NOTES'
  });
  console.log('Updated Evidence Notes:', updatedEvid?.notes);

  const deletedEvid = DbStore.deleteEvidence(testEvidenceId);
  console.log('Deleted Evidence Result:', deletedEvid);
  const foundEvidAfterDelete = DbStore.getEvidence().find(e => e.id === testEvidenceId);
  console.log('Found evidence after delete (should be undefined):', foundEvidAfterDelete);

  console.log('\n=== CRUD VERIFICATION COMPLETE ===');
}

run().catch(console.error);
