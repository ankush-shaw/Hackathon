import type {
  BrandRule,
  EvidenceRecord,
  ReviewRecord,
  ComplianceScanResult,
  DashboardMetrics,
  BrandAsset,
  GuidelineVersion
} from '../types';
import { StorageService } from '../storage/localStorage';
import { runComplianceScan } from '../engine/complianceEngine';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function safeFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const userSession = StorageService.getUserSession();
    const authHeaders: Record<string, string> = {};

    if (userSession) {
      authHeaders['X-User-Email'] = userSession.email || '';
      authHeaders['X-User-Role'] = userSession.role || '';
      authHeaders['X-User-Name'] = userSession.name || '';
      authHeaders['X-User-Company'] = userSession.company || '';
      try {
        const token = btoa(unescape(encodeURIComponent(JSON.stringify(userSession))));
        authHeaders['Authorization'] = `Bearer ${token}`;
      } catch {
        // Fallback to plain headers if btoa fails
      }
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[API Notice] Backend query to ${endpoint} unreachable or offline, using resilient local store:`, err);
    return null;
  }
}

export const apiClient = {
  // --- HEALTH ---
  async checkHealth(): Promise<{ status: string; geminiEnabled: boolean } | null> {
    return safeFetch('/api/health');
  },

  // --- GUIDELINES ---
  async getGuidelines(): Promise<BrandRule[]> {
    const remote = await safeFetch<BrandRule[]>('/api/guidelines');
    if (remote && Array.isArray(remote)) return remote;
    return StorageService.getRules();
  },

  async addGuideline(rule: BrandRule): Promise<BrandRule> {
    const remote = await safeFetch<BrandRule>('/api/guidelines', {
      method: 'POST',
      body: JSON.stringify(rule)
    });
    StorageService.addRule(rule);
    return remote || rule;
  },

  async toggleGuideline(id: string): Promise<void> {
    await safeFetch(`/api/guidelines/${encodeURIComponent(id)}/toggle`, { method: 'PATCH' });
    StorageService.toggleRuleActive(id);
  },

  async updateGuideline(id: string, updates: Partial<BrandRule>): Promise<BrandRule | null> {
    const remote = await safeFetch<BrandRule>(`/api/guidelines/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    StorageService.updateRule(id, updates);
    return remote;
  },

  async deleteGuideline(id: string): Promise<void> {
    await safeFetch(`/api/guidelines/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const rules = StorageService.getRules().filter(r => r.id !== id);
    StorageService.saveRules(rules);
  },

  async getGuidelineVersions(): Promise<GuidelineVersion[]> {
    const remote = await safeFetch<GuidelineVersion[]>('/api/guidelines/versions');
    return remote || [
      {
        id: 'gv-2-4',
        versionNumber: 2,
        versionTag: 'v2.4',
        description: 'Official Enterprise Brand & Regulatory Governance Baseline 2025',
        rulesSnapshot: StorageService.getRules(),
        createdAt: '2025-01-15T00:00:00Z'
      }
    ];
  },

  async createGuidelineVersion(tag: string, description: string): Promise<GuidelineVersion | null> {
    return safeFetch<GuidelineVersion>('/api/guidelines/versions', {
      method: 'POST',
      body: JSON.stringify({ tag, description })
    });
  },

  // --- EVIDENCE ---
  async getEvidence(): Promise<EvidenceRecord[]> {
    const remote = await safeFetch<EvidenceRecord[]>('/api/evidence');
    if (remote && Array.isArray(remote)) return remote;
    return StorageService.getEvidence();
  },

  async addEvidence(record: EvidenceRecord): Promise<EvidenceRecord> {
    const remote = await safeFetch<EvidenceRecord>('/api/evidence', {
      method: 'POST',
      body: JSON.stringify(record)
    });
    StorageService.addEvidence(record);
    return remote || record;
  },

  async deleteEvidence(id: string): Promise<void> {
    await safeFetch(`/api/evidence/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const list = StorageService.getEvidence().filter(e => e.id !== id);
    StorageService.saveEvidence(list);
  },

  async uploadEvidenceDocument(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      const res = await fetch(`${API_BASE}/api/evidence/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Document upload fallback:', err);
      // Local fallback
      const localRecord: EvidenceRecord = {
        id: `EVID-DOC-${Date.now()}`,
        code: `DOC-${file.name.slice(0, 6).toUpperCase()}`,
        title: file.name,
        claimOrFact: `Extracted content from ${file.name}. Review and approve prior to campaign substantiation.`,
        sourceReference: `Ingested Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        category: 'Technical Whitepaper',
        verificationStatus: 'unverified',
        validFrom: new Date().toISOString().split('T')[0],
        dateAdded: new Date().toISOString().split('T')[0]
      };
      StorageService.addEvidence(localRecord);
      return { message: 'Document ingested (client fallback)', extractedRecord: localRecord };
    }
  },

  // --- CAMPAIGNS & SCANNING ---
  async scanCampaign(content: string, channel: string): Promise<ComplianceScanResult> {
    const remote = await safeFetch<ComplianceScanResult>('/api/campaigns/scan', {
      method: 'POST',
      body: JSON.stringify({ content, channel })
    });
    if (remote) return remote;

    // Resilient local engine fallback
    const rules = StorageService.getRules();
    const evidence = StorageService.getEvidence();
    return runComplianceScan(content, channel, rules, evidence);
  },

  async getCampaigns(): Promise<ReviewRecord[]> {
    const remote = await safeFetch<ReviewRecord[]>('/api/campaigns');
    if (remote && Array.isArray(remote)) return remote;
    return StorageService.getReviews();
  },

  async createCampaign(data: {
    campaignName: string;
    channel: string;
    headline?: string;
    content: string;
    assetFileName?: string;
  }): Promise<ReviewRecord> {
    const remote = await safeFetch<ReviewRecord>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (remote) {
      StorageService.saveReview(remote);
      return remote;
    }

    // Local fallback
    const scan = runComplianceScan(data.content, data.channel, StorageService.getRules(), StorageService.getEvidence());
    const newId = StorageService.generateReviewId();
    const fallbackRecord: ReviewRecord = {
      id: newId,
      campaignName: data.campaignName,
      targetChannel: data.channel,
      headline: data.headline,
      content: data.content,
      activePolicyVersion: 'Acme Global 2025 v2.4',
      status: scan.status,
      brandHealthScore: scan.score,
      findings: scan.findings,
      versions: [
        {
          version: 1,
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          score: scan.score,
          findings: scan.findings
        }
      ],
      currentVersion: 1,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      hasCreativeAsset: !!data.assetFileName,
      assetFileName: data.assetFileName,
      auditLog: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Compliance Scan Completed',
          user: 'BrandGuard AI Engine',
          details: scan.summaryText
        }
      ]
    };
    StorageService.saveReview(fallbackRecord);
    return fallbackRecord;
  },

  async rescanCampaign(id: string, content: string): Promise<ReviewRecord | null> {
    const cleanId = encodeURIComponent(id);
    const remote = await safeFetch<ReviewRecord>(`/api/campaigns/${cleanId}/rescan`, {
      method: 'PUT',
      body: JSON.stringify({ content, id })
    });
    if (remote) {
      StorageService.saveReview(remote);
      return remote;
    }
    return null;
  },

  async deleteCampaign(id: string): Promise<void> {
    await safeFetch(`/api/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' });
    StorageService.deleteReview(id);
  },

  // --- REVIEWS & DECISIONS ---
  async submitForReview(id: string, notes: string, user: string): Promise<ReviewRecord | null> {
    return safeFetch<ReviewRecord>(`/api/reviews/${encodeURIComponent(id)}/submit`, {
      method: 'POST',
      body: JSON.stringify({ notes, user })
    });
  },

  async recordDecision(id: string, decision: string, reason: string, reviewer: string): Promise<ReviewRecord | null> {
    return safeFetch<ReviewRecord>(`/api/reviews/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason, reviewer })
    });
  },

  async recordOverride(id: string, findingId: string, reason: string, reviewer: string): Promise<ReviewRecord | null> {
    return safeFetch<ReviewRecord>(`/api/reviews/${encodeURIComponent(id)}/override`, {
      method: 'POST',
      body: JSON.stringify({ findingId, reason, reviewer })
    });
  },

  // --- BRAND ASSETS & ACCESSIBILITY ---
  async getAssets(): Promise<BrandAsset[]> {
    const remote = await safeFetch<BrandAsset[]>('/api/assets');
    return remote || [
      { id: '1', assetName: 'Brand Primary Blue', assetType: 'color', colorHex: '#2563EB', colorRole: 'Primary', createdAt: '2025-01-01' },
      { id: '2', assetName: 'Slate Navy', assetType: 'color', colorHex: '#0F172A', colorRole: 'Typography', createdAt: '2025-01-01' }
    ];
  },

  async analyzeCreativeAsset(params: { fileName: string; fileSizeBytes?: number; mimeType?: string; contentText?: string; hasAsset: boolean }) {
    return safeFetch<any>('/api/assets/analyze', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // --- REAL DASHBOARD METRICS ---
  async getDashboardMetrics(): Promise<DashboardMetrics | null> {
    return safeFetch<DashboardMetrics>('/api/analytics/dashboard');
  }
};

