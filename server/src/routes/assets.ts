import { Router } from 'express';
import multer from 'multer';
import { DbStore } from '../services/dbStore.js';
import { analyzeAssetMetadata } from '../services/visualChecker.js';
import { checkAccessibility } from '../services/accessibilityChecker.js';
import { runCreativeComplianceScan } from '../engine/creativeComplianceEngine.js';
import type { BrandAsset } from '../types/index.js';

export const assetsRouter = Router();

// Multer memory storage configuration for secure image ingestion
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB maximum file size
  }
});

// 1. Get brand assets
assetsRouter.get('/', (req, res) => {
  const assets = DbStore.getAssets();
  res.json(assets);
});

// 2. Add brand asset
assetsRouter.post('/', (req, res) => {
  const { assetName, assetType, fileUrl, colorHex, colorRole, fontFamily } = req.body;
  if (!assetName || !assetType) {
    return res.status(400).json({ error: 'assetName and assetType are required' });
  }

  const asset: BrandAsset = {
    id: `asset-${Date.now()}`,
    assetName,
    assetType,
    fileUrl,
    colorHex,
    colorRole,
    fontFamily,
    createdAt: new Date().toISOString()
  };

  const saved = DbStore.addAsset(asset);
  res.status(201).json(saved);
});

// 3. Real Image-Based Creative Compliance Analysis (Multipart upload)
// Accepts field name 'creative', 'image', or 'file'
assetsRouter.post(
  '/analyze-creative', 
  upload.fields([{ name: 'creative', maxCount: 1 }, { name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]),
  async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedFile = files?.creative?.[0] || files?.image?.[0] || files?.file?.[0];

      if (!uploadedFile) {
        return res.status(400).json({ 
          error: 'No image file uploaded. Please upload a PNG, JPG, JPEG, or WEBP image in form-data field "creative", "image", or "file".' 
        });
      }

      const rules = DbStore.getRules();
      const evidenceList = DbStore.getEvidence();
      const approvedAssets = DbStore.getAssets();
      const targetChannel = (req.body.channel || req.body.targetChannel || 'Banner Ad') as string;

      const analysisResult = await runCreativeComplianceScan({
        buffer: uploadedFile.buffer,
        originalFilename: uploadedFile.originalname,
        mimeType: uploadedFile.mimetype,
        targetChannel,
        rules,
        evidenceList,
        approvedAssets
      });

      // Save creative record in brand assets store for persistence
      const assetRecord: BrandAsset = {
        id: analysisResult.assetId,
        assetName: uploadedFile.originalname,
        assetType: 'guideline_document',
        fileUrl: analysisResult.assetFileUrl,
        metadata: {
          fileSizeBytes: analysisResult.fileSizeBytes,
          mimeType: analysisResult.mimeType,
          dimensions: analysisResult.dimensions,
          scores: analysisResult.scores,
          findingsCount: analysisResult.findings.length
        },
        createdAt: analysisResult.analyzedAt
      };
      DbStore.addAsset(assetRecord);

      res.status(200).json(analysisResult);
    } catch (err: any) {
      console.error('Creative Compliance Scan Error:', err?.message || err);
      res.status(400).json({ error: err?.message || 'Failed to analyze creative image' });
    }
  }
);

// 4. Backward-compatible metadata analyzer
assetsRouter.post('/analyze', (req, res) => {
  const { fileName, fileSizeBytes, mimeType, contentText, hasAsset } = req.body;

  const visualAnalysis = analyzeAssetMetadata(fileName || 'banner.png', fileSizeBytes || 1024000, mimeType || 'image/png');
  const accessibility = checkAccessibility(contentText || '', !!hasAsset, fileName);

  res.json({
    visualAnalysis,
    accessibility
  });
});
