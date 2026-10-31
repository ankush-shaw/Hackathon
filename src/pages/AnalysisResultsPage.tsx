import React, { useState } from 'react';
import type { ReviewRecord, Finding, EvidenceRecord, BrandRule, UserProfile } from '../types';
import { ScoreMeter } from '../components/review/ScoreMeter';
import { EvaluatedCopySnippet } from '../components/review/EvaluatedCopySnippet';
import { FindingCard } from '../components/review/FindingCard';
import { StickyActionBar } from '../components/review/StickyActionBar';
import { ExportReportModal } from '../components/review/ExportReportModal';
import { AttachEvidenceModal } from '../components/review/AttachEvidenceModal';
import { OverrideModal } from '../components/review/OverrideModal';
import { ShareWithLegalModal } from '../components/review/ShareWithLegalModal';
import { CreativeComplianceReportView } from '../components/creative/CreativeComplianceReportView';
import { apiClient } from '../api/client';
import { applySuggestionToText, applyAllSuggestionsToText } from '../engine/complianceEngine';
import { 
  FileText, 
  Share2, 
  RotateCw, 
  CheckCircle2, 
  Send, 
  Edit3, 
  History,
  Sparkles,
  Info,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

interface AnalysisResultsPageProps {
  review: ReviewRecord;
  rules: BrandRule[];
  evidenceList: EvidenceRecord[];
  onReviewUpdated: (updatedReview: ReviewRecord) => void;
  onNavigateHistory: () => void;
  currentUser?: UserProfile | null;
}

export const AnalysisResultsPage: React.FC<AnalysisResultsPageProps> = ({
  review,
  rules: _rules,
  evidenceList,
  currentUser,
  onReviewUpdated,
  onNavigateHistory,
}) => {
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(
    review.findings[0]?.id
  );
  const [activeTab, setActiveTab] = useState<'findings' | 'claims' | 'drift' | 'creative'>('findings');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState(review.content);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [targetEvidenceFinding, setTargetEvidenceFinding] = useState<Finding | null>(null);
  const [targetOverrideFinding, setTargetOverrideFinding] = useState<Finding | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRescanning, setIsRescanning] = useState(false);

  const [prevReviewId, setPrevReviewId] = useState(review.id);
  const [prevContent, setPrevContent] = useState(review.content);

  // Sync draftContent whenever active review or its content changes
  if (review.id !== prevReviewId || review.content !== prevContent) {
    setPrevReviewId(review.id);
    setPrevContent(review.content);
    setDraftContent(review.content);
    setSelectedFindingId(review.findings[0]?.id);
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stats calculation
  const criticalCount = review.findings.filter(f => f.severity === 'critical' && f.status !== 'applied').length;
  const unverifiedCount = review.findings.filter(f => f.severity === 'warning' && f.status !== 'applied').length;
  const suggestionCount = review.findings.filter(f => (f.category === 'trademark' || f.category === 'tone_sla') && f.severity !== 'verified' && f.status !== 'applied').length;
  const verifiedCount = review.findings.filter(f => f.severity === 'verified').length;

  const currentDiff = review.versions[review.versions.length - 1]?.diff;

  /**
   * Re-scan the current content or modified draft against backend engine
   */
  const handleRescan = async (contentToScan = draftContent) => {
    setIsRescanning(true);
    try {
      const updated = await apiClient.rescanCampaign(review.id, contentToScan);
      if (updated) {
        onReviewUpdated(updated);
        setIsEditingDraft(false);
        showToast(`Re-scan completed! Score: ${updated.brandHealthScore}/100`);
      }
    } catch (err: any) {
      showToast(`Re-scan failed: ${err.message}`);
    } finally {
      setIsRescanning(false);
    }
  };

  /**
   * Apply a suggested correction to text and auto-rescan
   */
  const handleApplySuggestion = async (finding: Finding) => {
    const baseText = draftContent || review.content;
    const updatedContent = applySuggestionToText(baseText, finding);
    setDraftContent(updatedContent);
    showToast(`Applied fix for "${finding.matchedText}". Rescanning...`);
    await handleRescan(updatedContent);
  };

  /**
   * Apply all suggestions in batch
   */
  const handleApplyAllSuggestions = async () => {
    const baseText = draftContent || review.content;
    const updatedContent = applyAllSuggestionsToText(baseText, review.findings);
    setDraftContent(updatedContent);
    showToast('Applied all suggestions! Rescanning...');
    await handleRescan(updatedContent);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const handleMarkReviewed = (findingId: string) => {
    const updatedFindings = review.findings.map(f =>
      f.id === findingId ? { ...f, status: 'reviewed' as const } : f
    );
    const updated: ReviewRecord = {
      ...review,
      findings: updatedFindings,
      auditLog: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Finding Marked Reviewed',
          user: 'Reviewer',
          details: `Marked finding ${findingId} as human reviewed.`
        },
        ...review.auditLog
      ]
    };
    onReviewUpdated(updated);
    showToast('Marked finding as reviewed.');
  };

  const handleMarkAllReviewed = () => {
    const updatedFindings = review.findings.map(f => ({
      ...f,
      status: 'reviewed' as const
    }));
    const updated: ReviewRecord = {
      ...review,
      findings: updatedFindings,
      auditLog: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'All Findings Acknowledged',
          user: 'Reviewer',
          details: 'User reviewed all active compliance warnings.'
        },
        ...review.auditLog
      ]
    };
    onReviewUpdated(updated);
    showToast('All items marked as reviewed.');
  };

  const reviewerLabel = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Authorized Reviewer (Brand Lead)';

  const handleApprove = async () => {
    try {
      const updated = await apiClient.recordDecision(review.id, 'Approved', 'Campaign conforms to enterprise guidelines and approved evidence.', reviewerLabel);
      if (updated) onReviewUpdated(updated);
      showToast('Campaign approved successfully!');
    } catch {
      showToast('Approval recorded.');
    }
  };

  const handleRequestRevision = async () => {
    try {
      const updated = await apiClient.recordDecision(review.id, 'Changes Requested', 'Changes required for unsupported claims and prohibited terms.', reviewerLabel);
      if (updated) onReviewUpdated(updated);
      showToast('Revision requested. Author notified.');
    } catch {
      showToast('Revision requested.');
    }
  };

  const handleConfirmAttachEvidence = (evidence: EvidenceRecord) => {
    if (!targetEvidenceFinding) return;

    const updatedFindings = review.findings.map(f => {
      if (f.id === targetEvidenceFinding.id) {
        return {
          ...f,
          severity: 'verified' as const,
          evidenceReference: `Attached: ${evidence.code} — ${evidence.title}`,
          status: 'applied' as const
        };
      }
      return f;
    });

    const updated: ReviewRecord = {
      ...review,
      findings: updatedFindings,
      auditLog: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Evidence Attached',
          user: 'Reviewer',
          details: `Attached ${evidence.code} to claim: "${targetEvidenceFinding.matchedText}"`
        },
        ...review.auditLog
      ]
    };

    onReviewUpdated(updated);
    setTargetEvidenceFinding(null);
    showToast(`Attached ${evidence.code}! Claim verified.`);
  };

  const handleConfirmOverride = async (reason: string) => {
    if (!targetOverrideFinding) return;

    try {
      const updated = await apiClient.recordOverride(review.id, targetOverrideFinding.id, reason, reviewerLabel);
      if (updated) {
        onReviewUpdated(updated);
      } else {
        const updatedFindings = review.findings.map(f => {
          if (f.id === targetOverrideFinding.id) {
            return { ...f, status: 'overridden' as const, overrideReason: reason };
          }
          return f;
        });
        onReviewUpdated({ ...review, findings: updatedFindings });
      }
      setTargetOverrideFinding(null);
      showToast('Compliance override logged to audit trail.');
    } catch (err: any) {
      showToast(`Override error: ${err.message}`);
    }
  };

  const handleConfirmShareWithLegal = async (notes: string, recipient: string) => {
    const authorLabel = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Campaign Author';
    try {
      const remote = await apiClient.submitForReview(review.id, notes, authorLabel);
      if (remote) {
        onReviewUpdated(remote);
      } else {
        const updated: ReviewRecord = {
          ...review,
          status: 'Submitted for Review',
          auditLog: [
            {
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: 'Dispatched to Legal',
              user: authorLabel,
              details: `Sent to ${recipient}: "${notes}"`
            },
            ...review.auditLog
          ]
        };
        onReviewUpdated(updated);
      }
      setShowShareModal(false);
      showToast(`Dispatched compliance package to ${recipient}`);
    } catch (err: any) {
      showToast(`Dispatch error: ${err.message}`);
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: 100 }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <Sparkles size={16} style={{ color: '#60a5fa' }} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="results-header-card">
        <div className="results-title-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="pill pill-neutral" style={{ fontSize: 11, fontWeight: 700 }}>
                {review.targetChannel}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Campaign ID: <strong>{review.id}</strong> • Analyzed {review.updatedAt || 'recently'}
              </span>
              {review.versions.length > 1 && (
                <span className="pill pill-purple" style={{ fontSize: 11 }}>
                  Revision v{review.currentVersion}
                </span>
              )}
            </div>
            <h1 className="page-title" style={{ fontSize: 24, margin: 0 }}>
              {review.campaignName}
            </h1>
          </div>

          <div className="results-header-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowExportModal(true)}
              id="btn-export-pdf"
            >
              <FileText size={14} />
              <span>Export PDF Report</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowShareModal(true)}
              id="btn-share-legal"
            >
              <Share2 size={14} />
              <span>Share with Legal</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleRescan(draftContent)}
              disabled={isRescanning}
              id="btn-rescan"
            >
              <RotateCw size={14} className={isRescanning ? 'spin' : ''} />
              <span>{isRescanning ? 'Scanning...' : 'Re-scan'}</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleApprove}
            >
              <CheckCircle2 size={14} style={{ color: '#10b981' }} />
              <span>Approve Ad</span>
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={handleRequestRevision}
            >
              <Send size={14} />
              <span>Request Revision</span>
            </button>
          </div>
        </div>

        {/* Compliance Audit Summary */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '10px 14px', 
          fontSize: 12.5, 
          color: 'var(--text-sub)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16
        }}>
          <Info size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>
            <strong>Audit Summary:</strong> {criticalCount} Rule Violation{criticalCount === 1 ? '' : 's'}, {unverifiedCount} Unsupported Claim{unverifiedCount === 1 ? '' : 's'}, {suggestionCount} Tone Recommendation{suggestionCount === 1 ? '' : 's'}. Active baseline: <strong>{review.activePolicyVersion}</strong>.
          </span>
        </div>

        {/* Creative Asset Compliance Banner if present */}
        {review.creativeAnalysis && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: 12.5,
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ImageIcon size={16} />
              <span>
                <strong>Creative Asset Attached:</strong> {review.assetFileName || 'Marketing Banner'} • {review.creativeAnalysis.dimensions.width}×{review.creativeAnalysis.dimensions.height}px (Creative Score: <strong>{review.creativeAnalysis.scores.overallCreativeScore}/100</strong>)
              </span>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('creative')}
              style={{ fontSize: 11, padding: '4px 10px' }}
            >
              Inspect Visual Canvas & OCR →
            </button>
          </div>
        )}

        {/* Score & Category Breakdown */}
        <ScoreMeter
          score={review.brandHealthScore}
          criticalCount={criticalCount}
          unverifiedCount={unverifiedCount}
          suggestionCount={suggestionCount}
          verifiedCount={verifiedCount}
        />
      </div>

      {/* Main Split Layout */}
      <div className="results-split-layout">
        {/* Left Column: Evaluated Copy Snippet & Versions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
              Evaluated Content
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditingDraft(!isEditingDraft)}
              style={{ fontSize: 12 }}
            >
              <Edit3 size={13} />
              <span>{isEditingDraft ? 'View Highlights' : 'Edit Copy Directly'}</span>
            </button>
          </div>

          {isEditingDraft ? (
            <div className="copy-panel-card">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                Modify Copy & Re-evaluate Against Evidence
              </div>
              <textarea
                className="form-textarea"
                rows={10}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setDraftContent(review.content);
                    setIsEditingDraft(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleRescan(draftContent)}
                  disabled={isRescanning}
                >
                  <RotateCw size={13} />
                  <span>{isRescanning ? 'Evaluating...' : 'Re-scan Modified Copy'}</span>
                </button>
              </div>
            </div>
          ) : (
            <EvaluatedCopySnippet
              headline={review.headline}
              content={review.content}
              channel={review.targetChannel}
              findings={review.findings}
              selectedFindingId={selectedFindingId}
              onSelectFinding={(id) => {
                setSelectedFindingId(id);
                const el = document.getElementById(`card-${id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              onCopyText={handleCopy}
            />
          )}

          {/* Revision Drift & History */}
          {review.versions.length > 1 && (
            <div style={{ 
              marginTop: 16, 
              background: 'white', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: 16,
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <History size={14} />
                  <span>Revision History ({review.versions.length} versions)</span>
                </div>
                <button 
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, padding: '2px 8px' }}
                  onClick={onNavigateHistory}
                >
                  All Campaigns →
                </button>
              </div>

              {/* Campaign Drift Diff Summary */}
              {currentDiff && (
                <div style={{ 
                  background: '#f8fafc', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 6, 
                  padding: '10px 12px', 
                  fontSize: 12,
                  marginBottom: 10
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={13} style={{ color: '#2563eb' }} />
                    <span>Campaign Drift from v{review.currentVersion - 1}:</span>
                    <span style={{ color: currentDiff.scoreDiff >= 0 ? '#059669' : '#b91c1c', fontWeight: 800 }}>
                      {currentDiff.scoreDiff >= 0 ? `+${currentDiff.scoreDiff}` : currentDiff.scoreDiff} pts
                    </span>
                  </div>
                  {currentDiff.modifiedClaims.length > 0 && (
                    <div style={{ color: 'var(--text-sub)', marginTop: 4 }}>
                      {currentDiff.modifiedClaims.map((mc, idx) => (
                        <div key={idx}>• {mc}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {review.versions.map((ver) => (
                  <div 
                    key={ver.version} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: ver.version === review.currentVersion ? '#eff6ff' : '#f8fafc',
                      borderRadius: 4,
                      fontSize: 12,
                      border: ver.version === review.currentVersion ? '1px solid #bfdbfe' : '1px solid transparent'
                    }}
                  >
                    <div>
                      <strong>Version {ver.version}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{ver.timestamp}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="pill pill-neutral" style={{ fontSize: 11 }}>
                        Score: {ver.score}/100
                      </span>
                      {ver.version !== review.currentVersion && (
                        <button 
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 8px', fontSize: 11 }}
                          onClick={() => {
                            setDraftContent(ver.content);
                            handleRescan(ver.content);
                          }}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Identified Findings & Extracted Claims */}
        <div>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8, flexWrap: 'wrap' }}>
            <button
              className={`filter-tab ${activeTab === 'findings' ? 'active' : ''}`}
              onClick={() => setActiveTab('findings')}
            >
              Identified Findings ({review.findings.length})
            </button>
            <button
              className={`filter-tab ${activeTab === 'claims' ? 'active' : ''}`}
              onClick={() => setActiveTab('claims')}
            >
              Extracted Claims ({review.claims?.length || 0})
            </button>
            {review.creativeAnalysis && (
              <button
                className={`filter-tab ${activeTab === 'creative' ? 'active' : ''}`}
                onClick={() => setActiveTab('creative')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ImageIcon size={13} style={{ color: 'var(--primary)' }} />
                <span>Creative Compliance ({review.creativeAnalysis.findings.length})</span>
              </button>
            )}
          </div>

          {activeTab === 'creative' && review.creativeAnalysis ? (
            <CreativeComplianceReportView report={review.creativeAnalysis} />
          ) : activeTab === 'findings' ? (
            <div className="finding-cards-list">
              {review.findings.length === 0 ? (
                <div style={{ 
                  background: 'white', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: 40, 
                  textAlign: 'center' 
                }}>
                  <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                    100% Policy Compliant!
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    No blocking violations, unsupported claims, or brand voice deviations were detected.
                  </div>
                </div>
              ) : (
                review.findings.map((f) => (
                  <FindingCard
                    key={f.id}
                    finding={f}
                    isSelected={f.id === selectedFindingId}
                    onApply={handleApplySuggestion}
                    onCopy={handleCopy}
                    onMarkReviewed={handleMarkReviewed}
                    onAttachEvidence={(finding) => setTargetEvidenceFinding(finding)}
                    onOverride={(finding) => setTargetOverrideFinding(finding)}
                  />
                ))
              )}
            </div>
          ) : (
            /* AI Extracted Claims Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(!review.claims || review.claims.length === 0) ? (
                <div style={{ padding: 32, textAlign: 'center', background: 'white', borderRadius: 8, border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  No empirical claims extracted for this copy.
                </div>
              ) : (
                review.claims.map((claim) => {
                  const status = claim.verification?.status || 'UNSUPPORTED';
                  let pillClass = 'pill-warning';
                  if (status === 'SUPPORTED') pillClass = 'pill-verified';
                  else if (status === 'CONTRADICTED' || status === 'EXPIRED') pillClass = 'pill-critical';

                  return (
                    <div
                      key={claim.id}
                      style={{
                        background: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 20px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span className={`pill ${pillClass}`} style={{ fontSize: 11, fontWeight: 700 }}>
                          ● {status}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          Category: <strong>{claim.category}</strong> • Confidence: {(claim.aiConfidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                        "{claim.matchedText}"
                      </div>

                      {claim.verification && (
                        <div style={{ fontSize: 12, color: 'var(--text-sub)', background: '#f8fafc', padding: '8px 12px', borderRadius: 4, marginBottom: 8 }}>
                          <strong>Verification Result:</strong> {claim.verification.explanation}
                          {claim.verification.matchedEvidenceCode && (
                            <div style={{ marginTop: 4, color: '#2563eb' }}>
                              Cites Evidence: <strong>{claim.verification.matchedEvidenceCode}</strong>
                            </div>
                          )}
                        </div>
                      )}

                      {claim.entities.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {claim.entities.map((ent, i) => (
                            <span key={i} className="pill pill-neutral" style={{ fontSize: 10 }}>
                              {ent}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyActionBar
        findings={review.findings}
        blockingViolationsCount={criticalCount}
        onCopyAllSuggestions={handleApplyAllSuggestions}
        onMarkAllReviewed={handleMarkAllReviewed}
        onApprove={handleApprove}
        onRequestRevision={handleRequestRevision}
        onExportReport={() => setShowExportModal(true)}
      />

      {/* Modals */}
      {showExportModal && (
        <ExportReportModal
          review={review}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showShareModal && (
        <ShareWithLegalModal
          review={review}
          onConfirm={handleConfirmShareWithLegal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {targetEvidenceFinding && (
        <AttachEvidenceModal
          finding={targetEvidenceFinding}
          evidenceList={evidenceList}
          onAttach={handleConfirmAttachEvidence}
          onClose={() => setTargetEvidenceFinding(null)}
        />
      )}

      {targetOverrideFinding && (
        <OverrideModal
          finding={targetOverrideFinding}
          defaultReviewerName={currentUser ? `${currentUser.name} (${currentUser.role})` : 'Authorized Reviewer (Brand Lead)'}
          onConfirm={handleConfirmOverride}
          onClose={() => setTargetOverrideFinding(null)}
        />
      )}
    </div>
  );
};
