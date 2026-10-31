import { Router } from 'express';
import { DbStore } from '../services/dbStore.js';
import { analyzeAssetMetadata } from '../services/visualChecker.js';
import { checkAccessibility } from '../services/accessibilityChecker.js';
import type { BrandAsset } from '../types/index.js';

export const assetsRouter = Router();

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

// 3. Analyze creative asset & check accessibility
assetsRouter.post('/analyze', (req, res) => {
  const { fileName, fileSizeBytes, mimeType, contentText, hasAsset } = req.body;

  const visualAnalysis = analyzeAssetMetadata(fileName || 'banner.png', fileSizeBytes || 1024000, mimeType || 'image/png');
  const accessibility = checkAccessibility(contentText || '', !!hasAsset, fileName);

  res.json({
    visualAnalysis,
    accessibility
  });
});

