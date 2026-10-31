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

export type Role = 'Admin' | 'Editor' | 'Reviewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  role: Role | string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  createdAt?: string;
}

export interface BrandRule {
  id: string;
  organizationId?: string;
  code: string;
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
  updatedAt?: string;
}

export interface GuidelineVersion {
  id: string;
  organizationId: string;
  versionNumber: number;
  versionTag: string; // e.g. 'v2.4'
  description?: string;
  rulesSnapshot: BrandRule[];
  createdBy?: string;
  createdAt?: string;
}

export interface EvidenceRecord {
  id: string;
  organizationId?: string;
  code: string; // e.g. "SLA-2025-V2"
  title: string;
  claimOrFact: string;
  sourceReference: string;
  category: string;
  verificationStatus: 'verified' | 'unverified' | 'disputed' | 'expired';
  notes?: string;
  validFrom: string;
  expirationDate?: string | null;
  uploadedBy?: string;
  documentFile?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface ClaimVerification {
  claimId: string;
  status: VerificationStatus;
  matchedEvidenceId?: string;
  matchedEvidenceCode?: string;
  explanation: string;
  supportingExcerpt?: string;
  missingInformation?: string;
  verifiedAt: string;
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

export interface CampaignRevision {
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

export interface Campaign {
  id: string;
  organizationId?: string;
  campaignName: string;
  targetChannel: string;
  headline?: string;
  content: string;
  activePolicyVersion: string;
  status: ReviewStatus;
  brandHealthScore: number;
  findings: Finding[];
  claims: ExtractedClaim[];
  versions: CampaignRevision[];
  currentVersion: number;
  hasCreativeAsset?: boolean;
  assetFileName?: string;
  auditLog: AuditLogEntry[];
  createdAt?: string;
  updatedAt: string;
  reviewedAt?: string;
}

export interface BrandAsset {
  id: string;
  organizationId?: string;
  assetName: string;
  assetType: 'logo' | 'color' | 'font' | 'guideline_document';
  fileUrl?: string;
  colorHex?: string;
  colorRole?: string;
  fontFamily?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
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
