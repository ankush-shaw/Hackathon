import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DbStore } from '../services/dbStore.js';
import { parseDocumentFile } from '../services/documentParser.js';
import type { EvidenceRecord } from '../types/index.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

export const evidenceRouter = Router();

const AUTHORIZED_EVIDENCE_ROLES = [
  'Brand Marketing Lead',
  'Compliance & Legal Counsel',
  'Admin',
  'Brand Manager',
  'Legal Reviewer'
];

// Upload directory setup
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain' || file.originalname.endsWith('.pdf') || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT documents are supported for automated evidence extraction.'));
    }
  }
});

// 1. Get all evidence
evidenceRouter.get('/', (req, res) => {
  const evidence = DbStore.getEvidence();
  res.json(evidence);
});

// 2. Add manual evidence record — RBAC Enforced
evidenceRouter.post('/', requireAuth, requireRoles(AUTHORIZED_EVIDENCE_ROLES), (req, res) => {
  const { code, title, claimOrFact, sourceReference, category, verificationStatus, notes, validFrom, expirationDate } = req.body;
  if (!title || !claimOrFact) {
    return res.status(400).json({ error: 'title and claimOrFact are required' });
  }

  const record: EvidenceRecord = {
    id: `EVID-CUSTOM-${Date.now()}`,
    code: code || `EVID-REV-${Math.floor(Math.random() * 900 + 100)}`,
    title,
    claimOrFact,
    sourceReference: sourceReference || 'Corporate Evidence Documentation',
    category: category || 'Comparative Benchmark',
    verificationStatus: verificationStatus || 'verified',
    notes,
    validFrom: validFrom || new Date().toISOString().split('T')[0],
    expirationDate: expirationDate || null,
    createdAt: new Date().toISOString()
  };

  const saved = DbStore.addEvidence(record);
  res.status(201).json(saved);
});

// 3. Upload & extract document file (PDF or TXT)
evidenceRouter.post('/upload', requireAuth, upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded' });
    }

    const parsed = await parseDocumentFile(req.file.path, req.file.mimetype);

    // Create a new unapproved/pending evidence record from extracted text
    const recordCode = `DOC-${path.basename(req.file.originalname, path.extname(req.file.originalname)).toUpperCase().slice(0, 8)}`;
    const newRecord: EvidenceRecord = {
      id: `EVID-DOC-${Date.now()}`,
      code: recordCode,
      title: req.file.originalname,
      claimOrFact: parsed.extractedFactsSummary || parsed.text.slice(0, 300),
      sourceReference: `Ingested Document: ${req.file.originalname} (${parsed.wordCount} words, ${parsed.pageCount || 1} pages)`,
      category: 'Technical Whitepaper',
      verificationStatus: 'unverified', // Never auto-mark uploaded documents as verified
      notes: `Uploaded via Document Ingestion pipeline. Extracted ${parsed.wordCount} words. Review content before formal approval.`,
      validFrom: new Date().toISOString().split('T')[0],
      expirationDate: null,
      documentFile: req.file.filename,
      createdAt: new Date().toISOString()
    };

    DbStore.addEvidence(newRecord);

    res.status(201).json({
      message: 'Document successfully parsed and added to evidence repository (pending approval)',
      extractedRecord: newRecord,
      parsedStats: {
        pageCount: parsed.pageCount,
        wordCount: parsed.wordCount,
        previewText: parsed.text.slice(0, 500)
      }
    });
  } catch (err) {
    next(err);
  }
});

// 4. Update evidence record (e.g. approve or change expiration date) — RBAC Enforced
evidenceRouter.put('/:id', requireAuth, requireRoles(AUTHORIZED_EVIDENCE_ROLES), (req, res) => {
  const updated = DbStore.updateEvidence(String(req.params.id), req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Evidence record not found' });
  }
  res.json(updated);
});

// 5. Delete evidence record — RBAC Enforced
evidenceRouter.delete('/:id', requireAuth, requireRoles(AUTHORIZED_EVIDENCE_ROLES), (req, res) => {
  const success = DbStore.deleteEvidence(String(req.params.id));
  if (!success) {
    return res.status(404).json({ error: 'Evidence record not found' });
  }
  res.json({ message: 'Evidence record deleted successfully' });
});


