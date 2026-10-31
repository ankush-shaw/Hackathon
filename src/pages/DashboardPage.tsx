import React, { useState, useEffect } from 'react';
import type { ReviewRecord, UserProfile, DashboardMetrics } from '../types';
import { apiClient } from '../api/client';
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Shield, 
  ArrowRight, 
  Plus, 
  BookOpen, 
  Search,
  Trash2,
  FileCheck2,
  History
} from 'lucide-react';

interface DashboardPageProps {
  reviews: ReviewRecord[];
  rulesCount: number;
  evidenceCount: number;
  user: UserProfile | null;
  onOpenReview: (reviewId: string) => void;
  onNewReview: () => void;
  onOpenGuidelines: () => void;
  onDeleteReview?: (reviewId: string) => void;
  onClearAllReviews?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  reviews,
  rulesCount,
  evidenceCount,
  user,
  onOpenReview,
  onNewReview,
  onOpenGuidelines,
  onDeleteReview,
  onClearAllReviews: _onClearAllReviews,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'action_required' | 'approved'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    apiClient.getDashboardMetrics().then(m => {
      if (m) setMetrics(m);
    });
  }, [reviews.length]);

  // Dynamic calculations from active reviews
  const totalReviewsCount = metrics?.totalCampaigns ?? reviews.length;
  const totalFlaggedClaims = metrics?.claimsFlagged ?? reviews.reduce((sum, r) => sum + r.findings.filter(f => f.severity !== 'verified').length, 0);
  const pendingApprovalCount = metrics?.pendingApprovals ?? reviews.filter(
    r => r.status === 'Submitted for Review' || r.status === 'In Review' || r.status === 'Action Required' || r.status === 'Needs Evidence' || r.status === 'Revision Requested'
  ).length;
  const completedReviewsCount = reviews.filter(r => r.status === 'Approved').length;
  const passRate = metrics?.passRate ?? (totalReviewsCount > 0 ? Math.round((completedReviewsCount / totalReviewsCount) * 100) : 100);

  const filteredReviews = reviews.filter(r => {
    if (filterTab === 'action_required') {
      if (r.status !== 'Action Required' && r.status !== 'Needs Evidence') return false;
    }
    if (filterTab === 'approved') {
      if (r.status !== 'Approved') return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        r.campaignName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.targetChannel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              Welcome back, {user ? user.name : 'Authorized User'}
            </h1>
            <span className="pill pill-verified" style={{ fontSize: 11 }}>
              ● Live Verified Engine
            </span>
          </div>
          <div className="page-subtitle" style={{ marginBottom: 0 }}>
            Real-time evidence verification, guideline compliance, and human approval for {user?.company || 'Enterprise'}.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            className="btn btn-secondary"
            onClick={onOpenGuidelines}
            id="dash-guidelines-btn"
          >
            <BookOpen size={14} />
            <span>Review Guidelines</span>
          </button>
          <button 
            className="btn btn-primary"
            onClick={onNewReview}
            id="dash-new-review-btn"
          >
            <Plus size={15} />
            <span>+ New Review</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="metrics-grid">
        {/* Card 1: Total Reviews */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Campaigns</span>
            <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <FileText size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-number">{totalReviewsCount}</div>
            <span className="metric-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
              Database Synced
            </span>
          </div>
          <div className="metric-footer">
            Tracked in organization repository
          </div>
        </div>

        {/* Card 2: Claims Flagged */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Claims Flagged</span>
            <div className="metric-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-number">{totalFlaggedClaims}</div>
            <span className="metric-badge" style={{ background: '#fffbeb', color: '#b45309' }}>
              Action Queue
            </span>
          </div>
          <div className="metric-footer">
            Claims requiring evidence citations
          </div>
        </div>

        {/* Card 3: Pending Approval */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Pending Approval</span>
            <div className="metric-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-number">{pendingApprovalCount}</div>
            <span className="metric-badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>
              {pendingApprovalCount} Action Items
            </span>
          </div>
          <div className="metric-footer">
            Awaiting legal review decisions
          </div>
        </div>

        {/* Card 4: Pass Rate */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Compliance Pass Rate</span>
            <div className="metric-icon-wrap" style={{ background: '#f0fdf4', color: '#059669' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-number">{passRate}%</div>
            <span className="metric-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
              {completedReviewsCount} Approved
            </span>
          </div>
          <div className="metric-footer">
            Compliant or approved campaign rate
          </div>
        </div>
      </div>

      {/* Evidence Integrity Breakdown Widget */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 24px',
        marginBottom: 20,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileCheck2 size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              Evidence Intelligence & Verification Status
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Real-time verification against {evidenceCount} active evidence records
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div style={{ padding: '12px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Supported Claims</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#065f46' }}>{metrics?.supportedClaimsCount ?? 0}</div>
            <div style={{ fontSize: 11.5, color: '#059669' }}>Substantiated by active SLAs</div>
          </div>

          <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fef08a' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Unsupported Claims</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#92400e' }}>{metrics?.unsupportedClaimsCount ?? 0}</div>
            <div style={{ fontSize: 11.5, color: '#d97706' }}>Missing audited citations</div>
          </div>

          <div style={{ padding: '12px 14px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>Contradicted Claims</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#991b1b' }}>{metrics?.contradictedClaimsCount ?? 0}</div>
            <div style={{ fontSize: 11.5, color: '#ef4444' }}>Conflicts with policy/facts</div>
          </div>

          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Expired Evidence</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#334155' }}>{metrics?.expiredEvidenceCount ?? 1}</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Requiring re-certification</div>
          </div>
        </div>
      </div>

      {/* Active Rule Policy Banner */}
      <div className="policy-banner">
        <div className="policy-left">
          <div className="policy-shield-icon">
            <Shield size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className="policy-title-row">
              <span className="policy-title">Active Policy: Acme Global 2025 v2.4</span>
              <span className="policy-enforced-tag">Enforced</span>
            </div>
            <div className="policy-subtext">
              {rulesCount} Rules Active • {evidenceCount} Evidence Whitepapers Synced • Hybrid Rule & AI Guard
            </div>
          </div>
        </div>

        <div className="policy-right">
          <div className="policy-status-indicator">
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
            <span>Continuous Monitoring Active</span>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenGuidelines}
          >
            <span>View Rule Set</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Recent Review History Table */}
      <div className="history-section-card">
        <div className="history-section-header">
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
              Recent Review History
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Campaign scans evaluated against active brand rules and verified evidence.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterTab === 'all' ? 'active' : ''}`}
                onClick={() => setFilterTab('all')}
              >
                All Reviews
              </button>
              <button
                className={`filter-tab ${filterTab === 'action_required' ? 'active' : ''}`}
                onClick={() => setFilterTab('action_required')}
              >
                Action Required
              </button>
              <button
                className={`filter-tab ${filterTab === 'approved' ? 'active' : ''}`}
                onClick={() => setFilterTab('approved')}
              >
                Approved
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 30, height: 34, fontSize: 12.5, width: 220 }}
                placeholder="Search campaigns..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No campaigns found</div>
            <div style={{ fontSize: 12.5, marginBottom: 16 }}>Create your first campaign review to run automated compliance checks.</div>
            <button className="btn btn-primary btn-sm" onClick={onNewReview}>
              + Start New Review
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Campaign Name & ID</th>
                  <th>Channel</th>
                  <th>Health Score</th>
                  <th>Status</th>
                  <th>Findings Breakdown</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r) => {
                  let statusPillClass = 'pill-warning';
                  if (r.status === 'Approved') statusPillClass = 'pill-verified';
                  else if (r.status === 'Action Required' || r.status === 'Rejected') statusPillClass = 'pill-critical';
                  else if (r.status === 'Revision Requested') statusPillClass = 'pill-purple';

                  const critCount = r.findings.filter(f => f.severity === 'critical').length;
                  const warnCount = r.findings.filter(f => f.severity === 'warning').length;

                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                          {r.campaignName}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {r.id} {r.versions.length > 1 && `(v${r.currentVersion})`}
                        </div>
                      </td>
                      <td>
                        <span className="pill pill-neutral" style={{ fontSize: 11 }}>
                          {r.targetChannel}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ 
                            fontWeight: 700, 
                            color: r.brandHealthScore >= 80 ? '#059669' : r.brandHealthScore >= 60 ? '#d97706' : '#ef4444' 
                          }}>
                            {r.brandHealthScore}/100
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${statusPillClass}`} style={{ fontSize: 11 }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {critCount > 0 && (
                            <span className="pill pill-critical" style={{ fontSize: 10 }}>
                              {critCount} Critical
                            </span>
                          )}
                          {warnCount > 0 && (
                            <span className="pill pill-warning" style={{ fontSize: 10 }}>
                              {warnCount} Warn
                            </span>
                          )}
                          {critCount === 0 && warnCount === 0 && (
                            <span className="pill pill-verified" style={{ fontSize: 10 }}>
                              Clean
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {r.updatedAt || r.createdAt}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenReview(r.id)}
                            title="Inspect compliance analysis"
                          >
                            <span>Inspect</span>
                            <ArrowRight size={12} />
                          </button>
                          {onDeleteReview && (
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#ef4444', padding: '4px 6px' }}
                              onClick={() => onDeleteReview(r.id)}
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Immutable Audit Trail Widget */}
      {metrics?.recentAuditLogs && metrics.recentAuditLogs.length > 0 && (
        <div style={{
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <History size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              Recent Organization Audit Trail
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {metrics.recentAuditLogs.map((log, i) => (
              <div 
                key={log.id || i}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: 6,
                  fontSize: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 70 }}>{log.timestamp}</span>
                  <strong style={{ minWidth: 140, color: 'var(--text-main)' }}>{log.action}</strong>
                  <span style={{ color: 'var(--text-sub)' }}>{log.details}</span>
                </div>
                <span className="pill pill-neutral" style={{ fontSize: 10 }}>{log.user}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
