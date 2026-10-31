import dotenv from 'dotenv';
import { extractClaims } from '../server/src/ai/claimExtractor.js';
import { verifyClaim } from '../server/src/ai/claimVerifier.js';
import { DbStore } from '../server/src/services/dbStore.js';

dotenv.config();

const originalCases = [
  { id: 'Case A', text: 'Our platform guarantees 10x revenue growth for every customer.' },
  { id: 'Case B', text: 'Our solution delivers a tenfold increase in business outcomes.' },
  { id: 'Case C', text: 'We provide 99.99% uptime availability.' },
  { id: 'Case D', text: 'Our service is completely unhackable.' },
  { id: 'Case E', text: 'Our platform supports enterprise-grade security.' },
  { id: 'Case F', text: 'Our software reduces operational costs by 40%.' },
  { id: 'Case G', text: "We are the world's number one cloud platform." },
  { id: 'Case H', text: 'Our platform helps teams manage their daily workflows.' }
];

const adversarialCases = [
  { id: 'Adv 01', text: 'We deliver a 10x ROI for every organization.' },
  { id: 'Adv 02', text: 'Our infrastructure maintains 99.999% high availability SLA.' },
  { id: 'Adv 03', text: 'Our cybersecurity framework guarantees zero zero-day vulnerabilities.' },
  { id: 'Adv 04', text: 'Our query latency averages less than 4 milliseconds globally.' },
  { id: 'Adv 05', text: 'Our solution cuts cloud hosting expenditure by thirty-five percent.' },
  { id: 'Adv 06', text: 'Our enterprise storage tier provides truly infinite capacity without limits.' },
  { id: 'Adv 07', text: 'We are recognized as the top-ranking CRM software globally.' },
  { id: 'Adv 08', text: 'We utilize standard OAuth 2.0 and SOC 2 Type II controls.' },
  { id: 'Adv 09', text: 'Guaranteed twentyfold increase in lead conversions.' },
  { id: 'Adv 10', text: 'Our proprietary algorithm is 100% immune to all ransomware.' },
  { id: 'Adv 11', text: 'Helps marketing specialists draft social media copy.' },
  { id: 'Adv 12', text: 'Rated number one by independent cloud analysts.' }
];

async function run() {
  await DbStore.initialize();
  const evidenceList = DbStore.getEvidence();

  console.log('================================================================');
  console.log('PART 1: 8 ORIGINAL AUDIT TEST CASES (LIVE LLM INFERENCE)');
  console.log('================================================================');
  for (const item of originalCases) {
    const claims = await extractClaims(item.text);
    if (claims.length === 0) {
      console.log(`[${item.id}] "${item.text}" -> No factual/empirical claims extracted (QUALITATIVE/GENERAL)`);
      continue;
    }
    for (const c of claims) {
      const verif = await verifyClaim(c, evidenceList);
      console.log(`[${item.id}] [${c.category.toUpperCase()}] "${c.matchedText}"`);
      console.log(`       Decision: ${verif.status} | Citation: ${verif.matchedEvidenceCode || 'None'}`);
      console.log(`       Reason: ${verif.explanation}`);
    }
  }

  console.log('\n================================================================');
  console.log('PART 2: 12 ADVERSARIAL PARAPHRASED CASES (LIVE LLM INFERENCE)');
  console.log('================================================================');
  for (const item of adversarialCases) {
    const claims = await extractClaims(item.text);
    if (claims.length === 0) {
      console.log(`[${item.id}] "${item.text}" -> No factual/empirical claims extracted (QUALITATIVE/GENERAL)`);
      continue;
    }
    for (const c of claims) {
      const verif = await verifyClaim(c, evidenceList);
      console.log(`[${item.id}] [${c.category.toUpperCase()}] "${c.matchedText}"`);
      console.log(`       Decision: ${verif.status} | Citation: ${verif.matchedEvidenceCode || 'None'}`);
      console.log(`       Reason: ${verif.explanation}`);
    }
  }

  console.log('\n================================================================');
  console.log('PART 3: RESILIENCE & FALLBACK STRESS TESTING');
  console.log('================================================================');

  // Test with invalid API key (Simulating 401/403/unavailable API)
  const savedKey = process.env.GEMINI_API_KEY;
  try {
    process.env.GEMINI_API_KEY = 'invalid_key_for_testing';
    console.log('Simulating Unavailable API / Fallback to Local Governance Engine...');
    const fallbackClaims = await extractClaims('We provide 99.99% uptime availability with zero scheduled downtime.');
    console.log(`Extracted claims via Local Governance Engine: ${fallbackClaims.length}`);
    for (const c of fallbackClaims) {
      const v = await verifyClaim(c, evidenceList);
      console.log(`  Fallback Decision: [${c.category}] "${c.matchedText}" -> ${v.status} (${v.matchedEvidenceCode || 'No citation'})`);
    }
  } finally {
    process.env.GEMINI_API_KEY = savedKey;
  }

  console.log('\n=== AI VERIFICATION TEST SUITE COMPLETE ===');
}

run().catch(console.error);

