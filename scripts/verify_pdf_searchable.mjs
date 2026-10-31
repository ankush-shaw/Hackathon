import http from 'http';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import { evidenceRouter } from '../server/src/routes/evidence.js';
import { authenticate } from '../server/src/middleware/auth.js';
import { DbStore } from '../server/src/services/dbStore.js';
import { verifyClaim } from '../server/src/ai/claimVerifier.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(authenticate);
app.use('/api/evidence', evidenceRouter);

// Minimal valid PDF generator with text content
function createPdfBuffer(text) {
  // A minimal valid single-page PDF with a text stream
  const stream = `BT /F1 12 Tf 50 700 Td (${text.replace(/[()]/g, '')}) Tj ET`;
  const streamLen = stream.length;
  
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length ${streamLen} >>
stream
${stream}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000282 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${380 + streamLen}
%%EOF`;

  return Buffer.from(content);
}

async function run() {
  await DbStore.initialize();
  const server = http.createServer(app);
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`PDF Verification Server running on port ${port}`);

  const authToken = Buffer.from(JSON.stringify({
    name: 'Compliance Officer',
    email: 'compliance@acme.com',
    role: 'Compliance & Legal Counsel',
    company: 'Acme Global Corp'
  })).toString('base64');

  const pdfDefinitions = [
    {
      filename: 'SOC2_Audit_Report.pdf',
      text: 'Acme Cloud is SOC 2 Type II Certified with zero trust segmentation audited by Deloitte in 2026.'
    },
    {
      filename: 'Benchmark_Telemetry_Report.pdf',
      text: 'Engineering micro benchmark demonstrates validated sub-3ms median query latency across 40 nodes.'
    },
    {
      filename: 'Financial_ROI_Whitepaper.pdf',
      text: 'Customer case study verifies 45% operational expenditure cost reduction within 90 days.'
    }
  ];

  const ingestedEvidenceIds = [];

  try {
    for (const [idx, def] of pdfDefinitions.entries()) {
      const pdfBuffer = createPdfBuffer(def.text);
      const tempPath = path.resolve(`temp_test_${idx}.pdf`);
      fs.writeFileSync(tempPath, pdfBuffer);

      // Create multipart/form-data boundary
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const header = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${def.filename}"\r\nContent-Type: application/pdf\r\n\r\n`
      );
      const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
      const body = Buffer.concat([header, fs.readFileSync(tempPath), footer]);

      const res = await fetch(`${baseUrl}/api/evidence/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Authorization': `Bearer ${authToken}`
        },
        body
      });

      fs.unlinkSync(tempPath);

      const json = await res.json();
      console.log(`\n[PDF #${idx + 1}: ${def.filename}] Upload status: HTTP ${res.status}`);
      console.log(`  Parsed Stats:`, json.parsedStats);
      console.log(`  Created Evidence Record:`, json.extractedRecord?.code, json.extractedRecord?.title);

      if (json.extractedRecord?.id) {
        ingestedEvidenceIds.push(json.extractedRecord.id);
        // Verify it exists in DbStore
        const found = DbStore.getEvidence().find(e => e.id === json.extractedRecord.id);
        console.log(`  Persisted in DbStore:`, !!found, `(Code: ${found?.code})`);
      }
    }

    console.log('\n--- VERIFY SEARCHABILITY DURING CLAIM VERIFICATION ---');
    // Test that the newly ingested whitepaper is searchable
    const allEvidence = DbStore.getEvidence();
    console.log(`Total evidence sources now available: ${allEvidence.length}`);

    const testClaim = {
      id: 'claim-pdf-latency',
      claimText: 'sub-3ms median query latency across all nodes',
      matchedText: 'sub-3ms median query latency across all nodes',
      category: 'performance',
      requiresEvidence: true,
      explanation: 'Empirical latency claim requiring published engineering benchmark',
      startIndex: 0,
      endIndex: 44
    };

    const verifResult = await verifyClaim(testClaim, allEvidence);
    console.log(`Claim Verification with Ingested Evidence:`);
    console.log(`  Claim: "${testClaim.matchedText}"`);
    console.log(`  Status: ${verifResult.status}`);
    console.log(`  Matched Evidence: ${verifResult.matchedEvidenceCode}`);
    console.log(`  Supporting Excerpt: ${verifResult.supportingExcerpt?.slice(0, 80)}...`);

  } finally {
    // Clean up ingested test records
    for (const id of ingestedEvidenceIds) {
      DbStore.deleteEvidence(id);
    }
    server.close();
    console.log('\nCleaned up all temporary PDF test records.');
  }
}

run().catch(console.error);

