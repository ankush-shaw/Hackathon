import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import type { 
  Campaign, 
  BrandRule, 
  EvidenceRecord, 
  GuidelineVersion, 
  BrandAsset, 
  AuditLogEntry, 
  UserProfile, 
  Organization,
  DashboardMetrics 
} from '../types/index.js';

// --- SUPABASE CLIENT & STATE ---
let _supabase: SupabaseClient | null = null;
let _supabaseConnected = false;

export function getSupabaseClient(): SupabaseClient | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  if (!_supabase) {
    try {
      _supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false }
      });
    } catch (err) {
      console.warn('⚠️ Could not initialize Supabase client:', err);
      _supabase = null;
    }
  }
  return _supabase;
}

export async function checkSupabaseConnection(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    _supabaseConnected = false;
    return false;
  }
  try {
    const { error } = await client.from('brand_guidelines').select('id').limit(1);
    if (error) {
      console.warn('⚠️ Supabase connection returned error:', error.message);
      _supabaseConnected = false;
      return false;
    }
    _supabaseConnected = true;
    return true;
  } catch (err: any) {
    console.warn('⚠️ Supabase check failed:', err?.message || err);
    _supabaseConnected = false;
    return false;
  }
}

// Local store file path
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'brandguard_store.json');

// Default Seed Data
const DEFAULT_RULES: BrandRule[] = [
  {
    id: 'RULE-PROHIBITED-GUARANTEE',
    code: 'Policy 4.2',
    title: 'Prohibited Absolute Guarantee',
    category: 'prohibited',
    categoryLabel: 'Critical: Prohibited Absolute Guarantee',
    severity: 'critical',
    description: 'Guarantees of specific numerical multiples or financial returns are prohibited without an executed enterprise contract SLA.',
    matchPattern: '(?:\\b(?:10x\\s+guaranteed|boost[^.]*?by\\s+\\d+x\\s+guaranteed|guaranteed\\s+10x|guaranteed\\s+results|guaranteed\\b))',
    isRegex: true,
    clarificationNote: 'Absolute performance or ROI guarantees without legal disclaimer and signed SLA are strictly prohibited under Acme Policy 4.2.',
    suggestedReplacement: 'accelerate your enterprise productivity with high efficiency',
    evidenceRequired: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'RULE-SUPERLATIVE-FASTEST',
    code: 'FTC COMPLIANCE',
    title: 'Comparative Market Claim Missing Evidence',
    category: 'evidence_required',
    categoryLabel: 'Missing Evidence • Category: Comparative Market Claim',
    severity: 'warning',
    description: 'Superlative rankings such as "#1 fastest" or "fastest on the market" require an audited third-party benchmark or accredited analyst report citation before public distribution.',
    matchPattern: '(?:voted\\s+#1\\s+fastest(?:\\s+cloud\\s+database(?:\\s+in\\s+North\\s+America)?)?|#1\\s+fastest\\s+cloud\\s+database|voted\\s+#1\\s+fastest|(?:unequivocally\\s+)?(?:the\\s+)?fastest\\s+on\\s+the\\s+market)',
    isRegex: true,
    clarificationNote: 'Missing evidence is not proof that this claim is false. However, regulatory (FTC) and brand policy requires an audited 3rd-party benchmark or analyst report citation before public distribution. Trust Principle: No evidence? Request human verification. Never fabricate proof.',
    suggestedReplacement: 'Designed for fast performance based on verified enterprise benchmarks [Add Citation]',
    evidenceRequired: true,
    requiredEvidenceCategory: 'Comparative Benchmark',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'RULE-TRADEMARK-NOMENCLATURE',
    code: 'Glossary v2.4',
    title: 'Approved Product Nomenclature',
    category: 'trademark',
    categoryLabel: 'Brand Voice • Trademark',
    severity: 'suggestion',
    description: 'Ensure accurate registered product trademarks are utilized on primary mentions.',
    matchPattern: 'Acme\\s+Cloud\\s+Platform',
    isRegex: true,
    clarificationNote: 'Brand guidelines require using registered trademark "Acme CloudSphere™" on initial mention instead of generic "Acme Cloud Platform".',
    suggestedReplacement: 'Acme CloudSphere™',
    evidenceRequired: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'RULE-TONE-DOWNTIME',
    code: 'SLA Alignment',
    title: 'Tone & SLA Clarity',
    category: 'tone_sla',
    categoryLabel: 'Recommendation • Category: Tone & SLA Clarity',
    severity: 'suggestion',
    description: 'Replace colloquial claims of zero downtime with specific contractually defined availability tiers.',
    matchPattern: 'without\\s+downtime',
    isRegex: true,
    clarificationNote: 'Recommended to state official 99.99% uptime SLA rather than colloquial "without downtime" to align with enterprise trust standards.',
    suggestedReplacement: 'with enterprise-grade 99.99% uptime availability.',
    evidenceRequired: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'RULE-VERIFIED-ZERO-DOWNTIME',
    code: 'SLA-2025-V2',
    title: 'Verified SLA Claim',
    category: 'tone_sla',
    categoryLabel: 'Verified by SLA Evidence',
    severity: 'verified',
    description: 'Patented architecture claim verified against SLA documentation.',
    matchPattern: '(?:zero\\s+scheduled\\s+downtime\\s+architecture|99\\.99%\\s+uptime\\s+availability|enterprise-grade\\s+99\\.99%\\s+uptime\\s+availability)',
    isRegex: true,
    clarificationNote: 'Supported by 99.99% active-active uptime guarantee documented in SLA attachment.',
    suggestedReplacement: 'zero scheduled downtime architecture',
    evidenceRequired: true,
    requiredEvidenceCategory: 'SLA & Architecture',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'RULE-UNHACKABLE-SECURITY',
    code: 'Security Policy 1.8',
    title: 'Prohibited Absolute Security Claims',
    category: 'prohibited',
    categoryLabel: 'Critical: Absolute Security Promise',
    severity: 'critical',
    description: 'Terms such as "100% unhackable", "bulletproof security", or "zero vulnerabilities" are legally misleading.',
    matchPattern: '(?:100%\\s+unhackable|unhackable|bulletproof\\s+security|zero\\s+vulnerabilities)',
    isRegex: true,
    clarificationNote: 'Security capabilities must be stated as rigorous defense-in-depth protocols, never as impenetrable guarantees.',
    suggestedReplacement: 'multi-layered defense-in-depth enterprise security architecture',
    evidenceRequired: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'RULE-UNLIMITED-TIER',
    code: 'Fair Use v3.1',
    title: 'Unqualified Unlimited Claims',
    category: 'evidence_required',
    categoryLabel: 'Fair Use & Capacity Claims',
    severity: 'warning',
    description: 'Claims of "unlimited storage" or "infinite compute" require fair usage policy references.',
    matchPattern: '(?:unlimited\\s+storage|infinite\\s+compute|unrestricted\\s+bandwidth)',
    isRegex: true,
    clarificationNote: 'Must note fair use policy and acceptable use guidelines in accompanying copy.',
    suggestedReplacement: 'elastic scalable storage subject to fair enterprise usage terms',
    evidenceRequired: true,
    requiredEvidenceCategory: 'Fair Use Terms',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  }
];

const DEFAULT_EVIDENCE: EvidenceRecord[] = [
  {
    id: 'EVID-SLA-2025-V2',
    code: 'SLA-2025-V2',
    title: 'Zero Scheduled Downtime SLA Guarantee',
    claimOrFact: 'Zero scheduled downtime architecture supported by 99.99% active-active uptime guarantee documented in SLA attachment.',
    sourceReference: 'Enterprise Master Service Agreement, Appendix D (SLA v2.4, Rev 2025)',
    category: 'SLA & Architecture',
    verificationStatus: 'verified',
    notes: 'Legal approved for enterprise cloud tier ad campaigns. Valid through Q4 2026.',
    validFrom: '2025-01-01',
    expirationDate: '2026-12-31',
    createdAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'EVID-CAT-2024',
    code: 'PROD-CAT-2024',
    title: 'Official Product Nomenclature and Trademark Standards',
    claimOrFact: 'Official registered name is Acme CloudSphere™. "Acme Cloud Platform" is deprecated internal nomenclature.',
    sourceReference: 'Global Brand Guidelines 2025, Section 3.2 Trademark Standards',
    category: 'Product Nomenclature',
    verificationStatus: 'verified',
    notes: 'Registered USPTO trademark #98234112.',
    validFrom: '2024-01-01',
    expirationDate: '2028-01-01',
    createdAt: '2024-11-20T00:00:00Z'
  },
  {
    id: 'EVID-SOC2-2025',
    code: 'SOC2-TYPE2-2025',
    title: 'SOC 2 Type II Independent Audit Report',
    claimOrFact: 'Comprehensive SOC 2 Type II and ISO 27001 data center security certifications.',
    sourceReference: 'Independent Auditor Report by Grant Thornton LLP, Issued Nov 2024',
    category: 'Security & Compliance',
    verificationStatus: 'verified',
    notes: 'Permitted for B2B security claims when citing current calendar year.',
    validFrom: '2024-12-01',
    expirationDate: '2027-12-01',
    createdAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'EVID-BENCHMARK-MISSING',
    code: 'BENCH-2024-NULL',
    title: 'North American Cloud Database Speed Benchmark (Searched)',
    claimOrFact: 'No third-party verified Gartner, Forrester, or IDC speed benchmark supporting #1 fastest claim in North America.',
    sourceReference: 'Internal Whitepaper Repository (14 papers searched, 0 verified external citations)',
    category: 'Comparative Benchmark',
    verificationStatus: 'unverified',
    notes: 'Missing evidence is not proof of falsehood, but regulatory and brand policy requires external citation before publication.',
    validFrom: '2024-01-01',
    expirationDate: null,
    createdAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'EVID-LATENCY-P99',
    code: 'BENCH-LATENCY-2024',
    title: 'Sub-5ms Query Latency Micro-Benchmark',
    claimOrFact: 'Verified p99 sub-5ms query latency across multi-region US-East and US-West deployment nodes.',
    sourceReference: 'CloudBench Engineering Whitepaper #88, July 2024',
    category: 'Performance Benchmark',
    verificationStatus: 'verified',
    notes: 'Must include footnote: "Based on internal 1M ops/sec synthetic workload benchmark".',
    validFrom: '2024-08-01',
    expirationDate: '2026-08-01',
    createdAt: '2024-08-12T00:00:00Z'
  },
  {
    id: 'EVID-EXPIRED-2023',
    code: 'BENCH-2023-EXPIRED',
    title: '2023 Query Throughput Benchmark (Superseded)',
    claimOrFact: 'Historical 2023 performance benchmark superseded by v2.4 cloud cluster release.',
    sourceReference: 'Legacy Benchmark Suite Rev 2023',
    category: 'Historical Benchmark',
    verificationStatus: 'expired',
    notes: 'Expired! Do not use for current campaign substantiations.',
    validFrom: '2023-01-01',
    expirationDate: '2024-01-01',
    createdAt: '2023-01-15T00:00:00Z'
  }
];

const DEFAULT_ASSETS: BrandAsset[] = [
  {
    id: 'asset-color-primary',
    assetName: 'Brand Primary Blue',
    assetType: 'color',
    colorHex: '#2563EB',
    colorRole: 'Primary Brand Color',
    createdAt: new Date().toISOString()
  },
  {
    id: 'asset-color-dark',
    assetName: 'Slate Charcoal',
    assetType: 'color',
    colorHex: '#0F172A',
    colorRole: 'Typography & Contrasts',
    createdAt: new Date().toISOString()
  },
  {
    id: 'asset-logo-master',
    assetName: 'Acme CloudSphere Official Logo',
    assetType: 'logo',
    fileUrl: '/public/favicon.svg',
    createdAt: new Date().toISOString()
  }
];

interface LocalDatabase {
  organization: Organization;
  users: UserProfile[];
  rules: BrandRule[];
  guidelineVersions: GuidelineVersion[];
  evidence: EvidenceRecord[];
  campaigns: Campaign[];
  assets: BrandAsset[];
  auditLogs: AuditLogEntry[];
}

let _cachedDb: LocalDatabase | null = null;

function loadLocalDb(): LocalDatabase {
  if (_cachedDb) return _cachedDb;

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      _cachedDb = JSON.parse(content);
      return _cachedDb!;
    } catch {
      // Fallback
    }
  }

  const initial: LocalDatabase = {
    organization: {
      id: 'org-acme-global',
      name: 'Acme Global Corporation',
      slug: 'acme-global',
      industry: 'Enterprise Cloud Infrastructure',
      createdAt: '2025-01-01T00:00:00Z'
    },
    users: [
      {
        id: 'user-sarah',
        name: 'Sarah Miller',
        email: 'sarah.miller@acmeglobal.com',
        company: 'Acme Global Corp',
        role: 'Brand Marketing Lead'
      },
      {
        id: 'user-team',
        name: 'Arpan Basak & Ankush Shaw',
        email: 'team@hopecoders.ai',
        company: 'HOPE_CODERS (Codex 48)',
        role: 'Admin'
      }
    ],
    rules: DEFAULT_RULES,
    guidelineVersions: [
      {
        id: 'gv-2-4',
        organizationId: 'org-acme-global',
        versionNumber: 2,
        versionTag: 'v2.4',
        description: 'Official Enterprise Brand & Regulatory Governance Baseline 2025',
        rulesSnapshot: DEFAULT_RULES,
        createdAt: '2025-01-15T00:00:00Z'
      }
    ],
    evidence: DEFAULT_EVIDENCE,
    campaigns: [],
    assets: DEFAULT_ASSETS,
    auditLogs: [
      {
        timestamp: 'Today, 9:00 AM',
        action: 'System Initialized',
        user: 'System Admin',
        details: 'Acme Global Brand Governance v2.4 Baseline Loaded with 6 Evidence Records.'
      }
    ]
  };

  saveLocalDb(initial);
  _cachedDb = initial;
  return initial;
}

function saveLocalDb(db: LocalDatabase): void {
  _cachedDb = db;
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
}

// --- POSTGRES MAPPER HELPERS ---
function mapRuleToPostgres(rule: BrandRule) {
  return {
    code: rule.code,
    title: rule.title,
    category: rule.category,
    category_label: rule.categoryLabel,
    severity: rule.severity,
    description: rule.description,
    match_pattern: rule.matchPattern,
    is_regex: rule.isRegex ?? true,
    clarification_note: rule.clarificationNote || null,
    suggested_replacement: rule.suggestedReplacement || null,
    evidence_required: rule.evidenceRequired ?? false,
    required_evidence_category: rule.requiredEvidenceCategory || null,
    applicable_channels: rule.applicableChannels || [],
    is_active: rule.isActive ?? true,
    updated_at: new Date().toISOString()
  };
}

function mapEvidenceToPostgres(e: EvidenceRecord) {
  return {
    code: e.code,
    title: e.title,
    claim_or_fact: e.claimOrFact,
    source_reference: e.sourceReference,
    category: e.category,
    verification_status: e.verificationStatus,
    notes: e.notes || null,
    valid_from: e.validFrom || new Date().toISOString().split('T')[0],
    expiration_date: e.expirationDate || null,
    updated_at: new Date().toISOString()
  };
}

function mapCampaignToPostgres(c: Campaign) {
  return {
    display_id: c.id,
    campaign_name: c.campaignName,
    target_channel: c.targetChannel,
    headline: c.headline || null,
    current_content: c.content,
    active_policy_version: c.activePolicyVersion || 'Acme Global 2025 v2.4',
    status: c.status,
    brand_health_score: c.brandHealthScore,
    has_creative_asset: c.hasCreativeAsset ?? false,
    asset_file_name: c.assetFileName || null,
    updated_at: new Date().toISOString()
  };
}

// --- ASYNCHRONOUS SUPABASE REPLICATION ---
async function replicateToSupabase(table: string, data: any, matchKey?: { column: string; value: any }) {
  const client = getSupabaseClient();
  if (!client || !_supabaseConnected) return;

  try {
    if (matchKey) {
      await client.from(table).upsert({ ...data, [matchKey.column]: matchKey.value });
    } else {
      await client.from(table).insert(data);
    }
  } catch (err: any) {
    console.warn(`[Supabase Sync Warning] Failed to replicate to ${table}:`, err?.message || err);
  }
}

async function deleteFromSupabase(table: string, column: string, value: any) {
  const client = getSupabaseClient();
  if (!client || !_supabaseConnected) return;

  try {
    await client.from(table).delete().eq(column, value);
  } catch (err: any) {
    console.warn(`[Supabase Delete Warning] Failed to delete from ${table}:`, err?.message || err);
  }
}

export class DbStore {
  /**
   * System Startup Initialization
   */
  static async initialize(): Promise<{ mode: string; supabaseConnected: boolean }> {
    loadLocalDb();

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('🔄 Probing Supabase PostgreSQL connectivity...');
      const connected = await checkSupabaseConnection();
      if (connected) {
        console.log('✅ Supabase PostgreSQL Database Connected & Synchronized');
        return { mode: 'cloud_supabase', supabaseConnected: true };
      } else {
        console.warn('⚠️ Supabase configured but unreachable or unmigrated; operating with local persistent store fallback.');
        return { mode: 'local_persistent_store', supabaseConnected: false };
      }
    }

    console.log('🗄️ Database Store: Local Persistent Store (Active at data/brandguard_store.json)');
    return { mode: 'local_persistent_store', supabaseConnected: false };
  }

  static async getDatabaseStatus(): Promise<{
    mode: 'cloud_supabase' | 'local_persistent_store';
    supabaseConfigured: boolean;
    supabaseConnected: boolean;
  }> {
    const configured = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
    return {
      mode: configured && _supabaseConnected ? 'cloud_supabase' : 'local_persistent_store',
      supabaseConfigured: configured,
      supabaseConnected: _supabaseConnected
    };
  }

  // --- RULES ---
  static getRules(): BrandRule[] {
    const db = loadLocalDb();
    return db.rules;
  }

  static addRule(rule: BrandRule): BrandRule {
    const db = loadLocalDb();
    db.rules.unshift(rule);
    saveLocalDb(db);
    this.addAuditLog('Rule Created', 'Brand Lead', `Added rule ${rule.code}: ${rule.title}`);

    // Replicate to Supabase
    void replicateToSupabase('brand_guidelines', mapRuleToPostgres(rule), { column: 'code', value: rule.code });

    return rule;
  }

  static updateRule(ruleId: string, updates: Partial<BrandRule>): BrandRule | undefined {
    const db = loadLocalDb();
    const idx = db.rules.findIndex(r => r.id === ruleId || r.code === ruleId);
    if (idx !== -1) {
      db.rules[idx] = { ...db.rules[idx], ...updates, updatedAt: new Date().toISOString() };
      saveLocalDb(db);
      this.addAuditLog('Rule Updated', 'Brand Lead', `Updated rule ${db.rules[idx].code}: ${db.rules[idx].title}`);

      // Replicate to Supabase
      void replicateToSupabase('brand_guidelines', mapRuleToPostgres(db.rules[idx]), { column: 'code', value: db.rules[idx].code });

      return db.rules[idx];
    }
    return undefined;
  }

  static deleteRule(ruleId: string): boolean {
    const db = loadLocalDb();
    const target = db.rules.find(r => r.id === ruleId || r.code === ruleId);
    if (!target) return false;

    db.rules = db.rules.filter(r => r.id !== ruleId && r.code !== ruleId);
    saveLocalDb(db);
    this.addAuditLog('Rule Deleted', 'Brand Lead', `Deleted rule ${target.code}: ${target.title}`);

    // Delete in Supabase
    void deleteFromSupabase('brand_guidelines', 'code', target.code);

    return true;
  }

  static toggleRule(ruleId: string): BrandRule | undefined {
    const db = loadLocalDb();
    const rule = db.rules.find(r => r.id === ruleId || r.code === ruleId);
    if (rule) {
      rule.isActive = !rule.isActive;
      rule.updatedAt = new Date().toISOString();
      saveLocalDb(db);
      this.addAuditLog('Rule Toggled', 'Brand Lead', `Toggled rule ${rule.code} to ${rule.isActive ? 'Active' : 'Inactive'}`);

      // Replicate to Supabase
      void replicateToSupabase('brand_guidelines', mapRuleToPostgres(rule), { column: 'code', value: rule.code });
    }
    return rule;
  }

  static createGuidelineVersion(tag: string, description: string): GuidelineVersion {
    const db = loadLocalDb();
    const verNum = db.guidelineVersions.length + 1;
    const newVersion: GuidelineVersion = {
      id: `gv-${Date.now()}`,
      organizationId: db.organization.id,
      versionNumber: verNum,
      versionTag: tag,
      description,
      rulesSnapshot: [...db.rules],
      createdAt: new Date().toISOString()
    };
    db.guidelineVersions.unshift(newVersion);
    saveLocalDb(db);
    this.addAuditLog('Guideline Version Created', 'Brand Lead', `Published baseline version ${tag}`);

    // Replicate to Supabase
    void replicateToSupabase('guideline_versions', {
      version_number: verNum,
      version_tag: tag,
      description,
      guidelines_snapshot: newVersion.rulesSnapshot,
      created_at: newVersion.createdAt
    });

    return newVersion;
  }

  static getGuidelineVersions(): GuidelineVersion[] {
    return loadLocalDb().guidelineVersions;
  }

  // --- EVIDENCE ---
  static getEvidence(): EvidenceRecord[] {
    return loadLocalDb().evidence;
  }

  static addEvidence(record: EvidenceRecord): EvidenceRecord {
    const db = loadLocalDb();
    db.evidence.unshift(record);
    saveLocalDb(db);
    this.addAuditLog('Evidence Added', 'Compliance Officer', `Added evidence record ${record.code}: ${record.title}`);

    // Replicate to Supabase
    void replicateToSupabase('evidence_sources', mapEvidenceToPostgres(record), { column: 'code', value: record.code });

    return record;
  }

  static updateEvidence(id: string, updates: Partial<EvidenceRecord>): EvidenceRecord | undefined {
    const db = loadLocalDb();
    const idx = db.evidence.findIndex(e => e.id === id || e.code === id);
    if (idx !== -1) {
      db.evidence[idx] = { ...db.evidence[idx], ...updates, updatedAt: new Date().toISOString() };
      saveLocalDb(db);

      // Replicate to Supabase
      void replicateToSupabase('evidence_sources', mapEvidenceToPostgres(db.evidence[idx]), { column: 'code', value: db.evidence[idx].code });

      return db.evidence[idx];
    }
    return undefined;
  }

  static deleteEvidence(id: string): boolean {
    const db = loadLocalDb();
    const target = db.evidence.find(e => e.id === id || e.code === id);
    if (!target) return false;

    db.evidence = db.evidence.filter(e => e.id !== id && e.code !== id);
    saveLocalDb(db);
    this.addAuditLog('Evidence Deleted', 'Compliance Officer', `Deleted evidence ${target.code}: ${target.title}`);

    // Delete in Supabase
    void deleteFromSupabase('evidence_sources', 'code', target.code);

    return true;
  }

  // --- CAMPAIGNS ---
  static getCampaigns(): Campaign[] {
    return loadLocalDb().campaigns;
  }

  static getCampaignById(id: string): Campaign | undefined {
    if (!id) return undefined;
    const cleanId = decodeURIComponent(id).trim();
    const withHash = cleanId.startsWith('#') ? cleanId : `#${cleanId}`;
    const withoutHash = cleanId.replace(/^#/, '');
    return loadLocalDb().campaigns.find(c => 
      c.id === cleanId || 
      c.id === withHash || 
      c.id === withoutHash ||
      c.id.replace(/^#/, '') === withoutHash
    );
  }

  static saveCampaign(campaign: Campaign): Campaign {
    const db = loadLocalDb();
    const idx = db.campaigns.findIndex(c => c.id === campaign.id);
    if (idx !== -1) {
      db.campaigns[idx] = campaign;
    } else {
      db.campaigns.unshift(campaign);
    }
    saveLocalDb(db);

    // Replicate to Supabase
    void replicateToSupabase('campaigns', mapCampaignToPostgres(campaign), { column: 'display_id', value: campaign.id });

    // Also replicate latest revision if present
    if (campaign.versions && campaign.versions.length > 0) {
      const latestRev = campaign.versions[campaign.versions.length - 1];
      void replicateToSupabase('campaign_revisions', {
        version_number: latestRev.version,
        content: latestRev.content,
        brand_health_score: latestRev.score,
        diff_summary: latestRev.diff || null,
        created_at: new Date().toISOString()
      });
    }

    return campaign;
  }

  static deleteCampaign(id: string): boolean {
    const db = loadLocalDb();
    const cleanId = decodeURIComponent(id).trim();
    const withHash = cleanId.startsWith('#') ? cleanId : `#${cleanId}`;
    const withoutHash = cleanId.replace(/^#/, '');

    const prevLen = db.campaigns.length;
    db.campaigns = db.campaigns.filter(c => 
      c.id !== cleanId && c.id !== withHash && c.id !== withoutHash
    );
    saveLocalDb(db);

    // Delete in Supabase
    void deleteFromSupabase('campaigns', 'display_id', withHash);

    return db.campaigns.length < prevLen;
  }

  // --- BRAND ASSETS ---
  static getAssets(): BrandAsset[] {
    return loadLocalDb().assets;
  }

  static addAsset(asset: BrandAsset): BrandAsset {
    const db = loadLocalDb();
    db.assets.unshift(asset);
    saveLocalDb(db);

    // Replicate to Supabase
    void replicateToSupabase('brand_assets', {
      asset_name: asset.assetName,
      asset_type: asset.assetType,
      file_url: asset.fileUrl || null,
      color_hex: asset.colorHex || null,
      color_role: asset.colorRole || null,
      font_family: asset.fontFamily || null
    });

    return asset;
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLogEntry[] {
    return loadLocalDb().auditLogs;
  }

  static addAuditLog(action: string, user: string, details: string, diffPayload?: any): void {
    const db = loadLocalDb();
    const log: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action,
      user,
      details,
      diffPayload
    };
    db.auditLogs.unshift(log);
    saveLocalDb(db);

    // Replicate to Supabase
    void replicateToSupabase('audit_logs', {
      action,
      details,
      diff_payload: diffPayload || null
    });
  }

  // --- REAL METRICS ---
  static getMetrics(): DashboardMetrics {
    const db = loadLocalDb();
    const campaigns = db.campaigns;

    const _totalClaims = campaigns.reduce((acc, c) => acc + (c.claims ? c.claims.length : 0), 0);
    const supportedClaims = campaigns.reduce((acc, c) => 
      acc + (c.claims ? c.claims.filter(cl => cl.verification?.status === 'SUPPORTED').length : 0), 0);
    const unsupportedClaims = campaigns.reduce((acc, c) => 
      acc + (c.claims ? c.claims.filter(cl => cl.verification?.status === 'UNSUPPORTED').length : 0), 0);
    const contradictedClaims = campaigns.reduce((acc, c) => 
      acc + (c.claims ? c.claims.filter(cl => cl.verification?.status === 'CONTRADICTED').length : 0), 0);

    const expiredEvidence = db.evidence.filter(e => e.verificationStatus === 'expired').length;
    const pendingApprovals = campaigns.filter(c => 
      c.status === 'Submitted for Review' || c.status === 'In Review' || c.status === 'Action Required' || c.status === 'Needs Evidence'
    ).length;
    const approvedCampaigns = campaigns.filter(c => c.status === 'Approved').length;
    const passRate = campaigns.length > 0 ? Math.round((approvedCampaigns / campaigns.length) * 100) : 100;

    return {
      totalCampaigns: campaigns.length,
      claimsFlagged: campaigns.reduce((acc, c) => acc + c.findings.filter(f => f.severity !== 'verified').length, 0),
      pendingApprovals,
      passRate,
      supportedClaimsCount: supportedClaims,
      unsupportedClaimsCount: unsupportedClaims,
      contradictedClaimsCount: contradictedClaims,
      expiredEvidenceCount: expiredEvidence,
      activeRulesCount: db.rules.filter(r => r.isActive).length,
      totalEvidenceCount: db.evidence.length,
      recentAuditLogs: db.auditLogs.slice(0, 8)
    };
  }
}
