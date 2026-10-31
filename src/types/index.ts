export type RuleCategory = 
  | 'prohibited'
  | 'trademark'
  | 'evidence_required'
  | 'tone_sla'
  | 'disclaimer'
  | 'visual'
  | 'accessibility';

export type Severity = 'critical' | 'warning' | 'suggestion' | 'verified';

export type VerificationStatus = 
  | 'SUPPORTED'
  | 'UNSUPPORTED'
  | 'CONTRADICTED'
  | 'EXPIRED'
  | 'UNCERTAIN';

export type ReviewStatus = 
  | 'Draft'
  | 'Submitted for Review'
  | 'In Review'
  | 'Action Required'
  | 'Needs Evidence'
  | 'Revision Requested'
  | 'Approved'
  | 'Rejected';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  company: string;
  role: string;
  avatarUrl?: string;
}

export interface BrandRule {
  id: string;
  code: string; // e.g. "Policy 4.2", "FTC COMPLIANCE", "Glossary v2.4"
  title: string;
  category: RuleCategory;
  categoryLabel: string;
  severity: Severity;
  description: string;
  matchPattern: string;
  isRegex: boolean;
  clarificationNote?: string;
  suggestedReplacement?: string;
  evidenceRequired: boolean;
  requiredEvidenceCategory?: string;
  applicableChannels?: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface GuidelineVersion {
  id: string;
  versionNumber: number;
  versionTag: string;
  description?: string;
  rulesSnapshot: BrandRule[];
  createdAt: string;
}

export interface EvidenceRecord {
  id: string;
  code: string; // e.g. "SLA-2025-V2", "PROD-CAT-2024"
  title: string;
  claimOrFact: string;
  sourceReference: string;
  category: string;
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'expired';
  notes?: string;
  validFrom: string;
  expirationDate?: string | null;
  dateAdded?: string;
  documentFile?: string;
  createdAt?: string;
}

export interface ClaimVerification {
  claimId: string;
  status: VerificationStatus;
  matchedEvidenceId?: string;
  matchedEvidenceCode?: string;
  explanation: string;
  supportingExcerpt?: string;
  missingInformation?: string;
  suggestedAlternative?: string | null;
  verifiedAt: string;
}

export interface ExtractedClaim {
  id: string;
  claimText: string;
  matchedText: string;
  category: 'performance' | 'comparative' | 'guarantee' | 'security' | 'pricing' | 'product_capability' | 'general';
  startIndex: number;
  endIndex: number;
  requiresEvidence: boolean;
  entities: string[];
  aiConfidence: number;
  explanation: string;
  verification?: ClaimVerification;
}

export interface Finding {
  id: string;
  ruleId?: string;
  ruleCode: string;
  category: RuleCategory;
  categoryLabel: string;
  severity: Severity;
  originalClaim: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  issue: string;
  clarificationNote?: string;
  evidenceReference?: string;
  suggestedAlternative?: string;
  actionLabel?: string;
  status: 'pending' | 'reviewed' | 'applied' | 'overridden';
  overrideReason?: string;
  attachedEvidenceId?: string;
}

export interface RevisionDiff {
  addedWords: string[];
  removedWords: string[];
  modifiedClaims: string[];
  scoreDiff: number;
  previousScore: number;
  newScore: number;
}

export interface ReviewVersion {
  version: number;
  content: string;
  timestamp: string;
  score: number;
  findings: Finding[];
  claims?: ExtractedClaim[];
  diff?: RevisionDiff;
}

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  diffPayload?: any;
}

export interface ReviewRecord {
  id: string; // e.g. "#BG-8924"
  campaignName: string;
  targetChannel: string;
  headline?: string;
  content: string;
  activePolicyVersion: string;
  status: ReviewStatus;
  brandHealthScore: number;
  findings: Finding[];
  claims?: ExtractedClaim[];
  versions: ReviewVersion[];
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  hasCreativeAsset?: boolean;
  assetFileName?: string;
  assetFileUrl?: string;
  creativeAnalysis?: CreativeAnalysisResult;
  auditLog: AuditLogEntry[];
}

export interface ComplianceScanResult {
  score: number;
  status: ReviewStatus;
  findings: Finding[];
  claims?: ExtractedClaim[];
  summaryText: string;
  stats: {
    criticalCount: number;
    unverifiedCount: number;
    suggestionCount: number;
    verifiedCount: number;
    totalClaims?: number;
    supportedClaims?: number;
    unsupportedClaims?: number;
    contradictedClaims?: number;
    expiredClaims?: number;
    uncertainClaims?: number;
  };
}

export interface BrandAsset {
  id: string;
  assetName: string;
  assetType: 'logo' | 'color' | 'font' | 'guideline_document';
  fileUrl?: string;
  colorHex?: string;
  colorRole?: string;
  fontFamily?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DashboardMetrics {
  totalCampaigns: number;
  claimsFlagged: number;
  pendingApprovals: number;
  passRate: number;
  supportedClaimsCount: number;
  unsupportedClaimsCount: number;
  contradictedClaimsCount: number;
  expiredEvidenceCount: number;
  activeRulesCount: number;
  totalEvidenceCount: number;
  recentAuditLogs: AuditLogEntry[];
}

// --- CREATIVE COMPLIANCE & IMAGE ANALYSIS TYPES ---

export interface BoundingBox {
  x0: number; // left px
  y0: number; // top px
  x1: number; // right px
  y1: number; // bottom px
  width: number;
  height: number;
}

export interface OcrTextBlock {
  id: string;
  text: string;
  confidence: number; // 0 - 100
  bbox: BoundingBox;
  lineIndex?: number;
}

export interface ExtractedColorSwatch {
  hex: string;
  rgb: [number, number, number];
  percentage: number;
  isApprovedBrandColor: boolean;
  matchedBrandColor?: string;
  colorDistanceDeltaE: number;
}

export interface ColorComplianceAnalysis {
  status: 'Compliant' | 'Deviation Detected' | 'Unverified';
  dominantColors: ExtractedColorSwatch[];
  approvedPalette: { name: string; hex: string; role?: string }[];
  unapprovedDominantColors: ExtractedColorSwatch[];
  missingApprovedColors: { name: string; hex: string; role?: string }[];
  details: string;
  colorScore: number; // 0 - 100
}

export interface TextRegionContrast {
  textSnippet: string;
  bbox: BoundingBox;
  textColorHex: string;
  backgroundColorHex: string;
  contrastRatio: number;
  wcagAALarge: boolean;
  wcagAANormal: boolean; // 4.5:1
  wcagAAALarge: boolean;
  wcagAAANormal: boolean; // 7.0:1
  status: 'PASS' | 'FAIL' | 'ESTIMATE' | 'UNAVAILABLE';
  isEstimate?: boolean;
}

export interface ContrastComplianceAnalysis {
  passCount: number;
  failCount: number;
  overallRatioAverage: number;
  regions: TextRegionContrast[];
  wcagAARate: number;
  details: string;
  contrastScore: number;
}

export interface LayoutComplianceAnalysis {
  imageDimensions: { width: number; height: number; aspectRatio: string };
  overflowRisks: { textSnippet: string; bbox: BoundingBox; marginDistancePx: number; edge: string }[];
  smallTextRisks: { textSnippet: string; bbox: BoundingBox; heightPx: number; warning: string }[];
  densityCrowding: { textCoveragePercent: number; isCrowded: boolean; warning?: string };
  layoutScore: number;
  details: string;
}

export interface LogoComplianceAnalysis {
  referenceLogoFound: boolean;
  referenceLogoAsset?: string;
  logoDetectedInImage: boolean;
  confidence?: number;
  status: 'Verified' | 'Not Detected' | 'Missing Reference Asset' | 'Potential Inconsistency';
  details: string;
}

export interface GeminiCreativeInsights {
  overallCreativeImpression: string;
  visualConsistencyRating: 'High' | 'Medium' | 'Low';
  contextualObservations: string[];
  suggestedCreativeImprovements: string[];
  disclaimerPlacementAssessment: string;
  modelUsed: string;
  isAiFallbackEngaged: boolean;
}

export interface CreativeFinding {
  id: string;
  type: 'textual' | 'visual' | 'contrast' | 'layout' | 'color' | 'logo';
  detectedText?: string;
  category: string;
  severity: 'critical' | 'warning' | 'suggestion' | 'verified';
  status: 'SUPPORTED' | 'UNSUPPORTED' | 'CONTRADICTED' | 'UNVERIFIED' | 'POLICY_VIOLATION';
  explanation: string;
  relatedGuideline?: string;
  evidenceReference?: string;
  suggestedCorrection?: string;
  confidence: number;
  bbox?: BoundingBox;
}

export interface CreativeAnalysisResult {
  assetId: string;
  assetFileName: string;
  assetFileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  dimensions: { width: number; height: number };
  extractedOcrText: string;
  ocrConfidence: number;
  textBlocks: OcrTextBlock[];
  visualAnalysis: {
    colorCompliance: ColorComplianceAnalysis;
    contrastCompliance: ContrastComplianceAnalysis;
    layoutCompliance: LayoutComplianceAnalysis;
    logoCompliance: LogoComplianceAnalysis;
  };
  geminiInsights?: GeminiCreativeInsights;
  findings: CreativeFinding[];
  textualClaims: ExtractedClaim[];
  scores: {
    overallCreativeScore: number;
    textualScore: number;
    visualScore: number;
    colorScore: number;
    contrastScore: number;
    layoutScore: number;
  };
  analyzedAt: string;
}
