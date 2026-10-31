import dotenv from 'dotenv';
import { DbStore } from '../server/src/services/dbStore.js';

dotenv.config();

async function run() {
  console.log('--- SESSION 1: WRITE RECORD ---');
  await DbStore.initialize();
  const testCampaignId = `CAMP-RESTART-${Date.now()}`;
  const campaign = {
    id: testCampaignId,
    campaignName: 'Server Restart Persistence Test Campaign',
    targetChannel: 'Email Newsletter',
    headline: 'High Durability Cloud Storage',
    content: 'We provide 99.99% uptime availability across multiple regions.',
    activePolicyVersion: 'v2.4',
    status: 'Approved',
    brandHealthScore: 98,
    findings: [],
    versions: [],
    currentVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasCreativeAsset: false,
    auditLog: [{
      timestamp: new Date().toLocaleTimeString(),
      action: 'Created for restart persistence test',
      user: 'Test Runner',
      details: 'Will verify after full store re-initialization'
    }]
  };

  DbStore.saveCampaign(campaign);
  console.log(`Saved campaign ${testCampaignId}`);

  console.log('\n--- SIMULATING SERVER RESTART ---');
  // Re-initialize DbStore from scratch
  await DbStore.initialize();

  const retrieved = DbStore.getCampaignById(testCampaignId);
  console.log('Retrieved campaign after restart simulation:', !!retrieved, retrieved?.id, retrieved?.campaignName);

  // Clean up
  DbStore.deleteCampaign(testCampaignId);
  console.log('Cleaned up test campaign.');
}

run().catch(console.error);

