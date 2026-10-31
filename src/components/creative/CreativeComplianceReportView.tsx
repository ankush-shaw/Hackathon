import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Copy, 
  Check, 
  FileText, 
  Layers, 
  Maximize2 
} from 'lucide-react';
import type { 
  CreativeAnalysisResult, 
  CreativeFinding, 
  BoundingBox 
} from '../../types';

interface CreativeComplianceReportViewProps {
  report: CreativeAnalysisResult;
  onApplyFix?: (finding: CreativeFinding) => void;
  showCompact?: boolean;
}

export const CreativeComplianceReportView: React.FC<CreativeComplianceReportViewProps> = ({
  report,
  onApplyFix: _onApplyFix,
  showCompact: _showCompact = false
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'textual' | 'contrast' | 'insights'>('visual');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    assetFileName,
    assetFileUrl,
    dimensions,
    scores,
    visualAnalysis,
    findings,
    extractedOcrText,
    ocrConfidence,
    geminiInsights
  } = report;

  const criticalFindings = findings.filter(f => f.severity === 'critical');
  const warningFindings = findings.filter(f => f.severity === 'warning');
  const suggestionFindings = findings.filter(f => f.severity === 'suggestion');
  const verifiedFindings = findings.filter(f => f.severity === 'verified');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Find active bounding box for selected finding
  const selectedFinding = findings.find(f => f.id === selectedFindingId);

  return (
    <div className="creative-compliance-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Header & Score Overview Banner */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span className="pill pill-primary" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Layers size={13} />
                <span>Multimodal Creative Compliance</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {assetFileName} • {dimensions.width}×{dimensions.height}px
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
              Creative Compliance Audit Report
            </h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className={`pill ${criticalFindings.length > 0 ? 'pill-critical' : 'pill-neutral'}`} style={{ fontSize: 10.5 }}>
                {criticalFindings.length} Critical
              </span>
              <span className={`pill ${warningFindings.length > 0 ? 'pill-warning' : 'pill-neutral'}`} style={{ fontSize: 10.5 }}>
                {warningFindings.length} Warnings
              </span>
              <span className="pill pill-neutral" style={{ fontSize: 10.5 }}>
                {suggestionFindings.length} Suggestions
              </span>
              <span className="pill pill-verified" style={{ fontSize: 10.5 }}>
                {verifiedFindings.length} Verified
              </span>
            </div>
          </div>

          {/* Overall Score Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Unified Creative Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'flex-end' }}>
                <span style={{ 
                  fontSize: 32, 
                  fontWeight: 800, 
                  color: scores.overallCreativeScore >= 80 ? '#10b981' : scores.overallCreativeScore >= 60 ? '#f59e0b' : '#ef4444' 
                }}>
                  {scores.overallCreativeScore}
                </span>
                <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>

            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: scores.overallCreativeScore >= 80 ? '#ecfdf5' : scores.overallCreativeScore >= 60 ? '#fffbeb' : '#fef2f2',
              color: scores.overallCreativeScore >= 80 ? '#10b981' : scores.overallCreativeScore >= 60 ? '#f59e0b' : '#ef4444'
            }}>
              {scores.overallCreativeScore >= 80 ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
            </div>
          </div>
        </div>

        {/* Score Breakdown Metrics Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
          gap: 12,
          padding: '16px',
          background: '#f8fafc',
          borderRadius: 'var(--radius-md)'
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Visual Compliance</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{scores.visualScore}/100</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Palette & Contrast</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Textual Governance</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5' }}>{scores.textualScore}/100</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Claims & Policies</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>WCAG 2.1 AA Contrast</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: visualAnalysis.contrastCompliance.wcagAARate >= 80 ? '#10b981' : '#f59e0b' }}>
              {visualAnalysis.contrastCompliance.wcagAARate}%
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{visualAnalysis.contrastCompliance.passCount} pass / {visualAnalysis.contrastCompliance.failCount} fail</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Brand Palette Score</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: visualAnalysis.colorCompliance.colorScore >= 80 ? '#10b981' : '#f59e0b' }}>
              {visualAnalysis.colorCompliance.colorScore}/100
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{visualAnalysis.colorCompliance.status}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>OCR Confidence</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{ocrConfidence}%</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{report.textBlocks.length} text blocks</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Image Viewer with Bounding Box Overlay */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
              Interactive Visual Inspection Canvas
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              (Click findings to highlight regions on image)
            </span>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            style={{ fontSize: 12 }}
          >
            <Maximize2 size={13} />
            <span>{showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}</span>
          </button>
        </div>

        {/* Visual Canvas Container with Coordinate Scaling */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxHeight: 520,
          background: '#0f172a',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #1e293b'
        }}>
          {assetFileUrl && (
            <div style={{ position: 'relative', maxWidth: '100%', maxHeight: 520, display: 'inline-block' }}>
              <img
                src={assetFileUrl}
                alt={assetFileName}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: 520,
                  objectFit: 'contain'
                }}
              />

              {/* SVG Bounding Boxes Overlay */}
              {showBoundingBoxes && (
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                  viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                >
                  {/* Draw Text Block Bounding Boxes */}
                  {report.textBlocks.map(block => (
                    <rect
                      key={block.id}
                      x={block.bbox.x0}
                      y={block.bbox.y0}
                      width={block.bbox.width}
                      height={block.bbox.height}
                      fill="rgba(59, 130, 246, 0.08)"
                      stroke="rgba(59, 130, 246, 0.45)"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                  ))}

                  {/* Draw Specific Compliance Finding Highlights */}
                  {findings.filter(f => f.bbox).map(finding => {
                    const isSelected = finding.id === selectedFindingId;
                    const strokeColor = finding.severity === 'critical' 
                      ? '#ef4444' 
                      : finding.severity === 'warning' 
                      ? '#f59e0b' 
                      : finding.severity === 'verified'
                      ? '#10b981'
                      : '#6366f1';

                    const bbox = finding.bbox as BoundingBox;
                    return (
                      <g key={`finding-box-${finding.id}`}>
                        <rect
                          x={bbox.x0 - 2}
                          y={bbox.y0 - 2}
                          width={bbox.width + 4}
                          height={bbox.height + 4}
                          fill={isSelected ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.12)'}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 4 : 2.5}
                          style={{
                            transition: 'all 0.2s ease',
                            filter: isSelected ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))' : 'none'
                          }}
                        />
                        {isSelected && (
                          <text
                            x={bbox.x0}
                            y={Math.max(16, bbox.y0 - 6)}
                            fill="white"
                            fontSize="13"
                            fontWeight="bold"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}
                          >
                            ⚠️ {finding.category.toUpperCase()}: {finding.relatedGuideline || 'Flagged'}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Selected Finding Callout if clicked */}
        {selectedFinding && (
          <div style={{
            marginTop: 12,
            padding: '12px 16px',
            background: selectedFinding.severity === 'critical' ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${selectedFinding.severity === 'critical' ? '#fecaca' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: selectedFinding.severity === 'critical' ? '#991b1b' : '#92400e' }}>
                Active Region Highlight: "{selectedFinding.detectedText}"
              </span>
              <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                {selectedFinding.explanation}
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedFindingId(null)}
              style={{ fontSize: 11 }}
            >
              Clear Focus
            </button>
          </div>
        )}
      </div>

      {/* 3. Detailed Analysis Tabs Navigation */}
      <div style={{
        background: 'white',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 12,
          marginBottom: 20
        }}>
          <button
            className={`filter-tab ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>🎨 Brand Palette & Pixels</span>
            <span className="pill pill-neutral" style={{ fontSize: 10 }}>{visualAnalysis.colorCompliance.status}</span>
          </button>

          <button
            className={`filter-tab ${activeTab === 'contrast' ? 'active' : ''}`}
            onClick={() => setActiveTab('contrast')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>👁️ WCAG 2.1 Contrast</span>
            <span className={`pill ${visualAnalysis.contrastCompliance.failCount > 0 ? 'pill-critical' : 'pill-verified'}`} style={{ fontSize: 10 }}>
              {visualAnalysis.contrastCompliance.wcagAARate}% AA
            </span>
          </button>

          <button
            className={`filter-tab ${activeTab === 'textual' ? 'active' : ''}`}
            onClick={() => setActiveTab('textual')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>📝 OCR Claims & Evidence ({findings.length})</span>
          </button>

          <button
            className={`filter-tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Sparkles size={13} />
            <span>AI Vision Insights</span>
          </button>
        </div>

        {/* TAB 1: VISUAL BRAND & PALETTE ANALYSIS */}
        {activeTab === 'visual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Dominant Colors Strip */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                Actual Extracted Image Colors (Pixel Area Proportions)
              </h4>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>
                Pixel-level sampling extracts dominant colors and evaluates distance against your active brand palette.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {visualAnalysis.colorCompliance.dominantColors.map((swatch, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: 12,
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 6,
                        background: swatch.hex,
                        border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: 'var(--shadow-sm)',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                        {swatch.hex}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {swatch.percentage}% of canvas
                      </div>
                      <div style={{ marginTop: 4 }}>
                        {swatch.isApprovedBrandColor ? (
                          <span className="pill pill-verified" style={{ fontSize: 9.5 }}>
                            Brand Aligned (ΔE {swatch.colorDistanceDeltaE})
                          </span>
                        ) : (
                          <span className="pill pill-warning" style={{ fontSize: 9.5 }}>
                            Unapproved Tone
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved Brand Palette Reference */}
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                Approved Organization Brand Palette (Benchmark Baseline)
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {visualAnalysis.colorCompliance.approvedPalette.map((app, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: app.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-main)' }}>{app.name}</span>
                    <span style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'monospace' }}>{app.hex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout and Quality Audit */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                Layout, Margins & Safe Bleed Inspection
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                    Canvas Aspect Ratio & Trim
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-sub)' }}>
                    Aspect Ratio: <strong>{visualAnalysis.layoutCompliance.imageDimensions.aspectRatio}</strong> ({dimensions.width}×{dimensions.height}px).
                  </div>
                </div>

                <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                    Text Density Coverage
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-sub)' }}>
                    Text occupies <strong>{visualAnalysis.layoutCompliance.densityCrowding.textCoveragePercent}%</strong> of canvas.
                    {visualAnalysis.layoutCompliance.densityCrowding.isCrowded ? ' ⚠️ Crowded negative space.' : ' Balanced whitespace.'}
                  </div>
                </div>

                <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                    Logo Trademark Alignment
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-sub)' }}>
                    Status: <strong>{visualAnalysis.logoCompliance.status}</strong>. {visualAnalysis.logoCompliance.details}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WCAG 2.1 CONTRAST ANALYSIS */}
        {activeTab === 'contrast' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  WCAG 2.1 Relative Luminance Contrast Verification
                </h4>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Standard text requires 4.5:1 for AA (7:1 for AAA). Large banners require 3.0:1 for AA.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <span className="pill pill-verified">{visualAnalysis.contrastCompliance.passCount} Passing</span>
                {visualAnalysis.contrastCompliance.failCount > 0 && (
                  <span className="pill pill-critical">{visualAnalysis.contrastCompliance.failCount} Failing</span>
                )}
              </div>
            </div>

            {/* Region Contrast Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visualAnalysis.contrastCompliance.regions.map((reg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${reg.status === 'FAIL' ? '#fecaca' : 'var(--border-color)'}`,
                    background: reg.status === 'FAIL' ? '#fef2f2' : 'white',
                    gap: 16
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 3 }}>
                      "{reg.textSnippet}"
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: 'var(--text-muted)' }}>
                      <span>Text: <strong style={{ fontFamily: 'monospace' }}>{reg.textColorHex}</strong></span>
                      <span>Background: <strong style={{ fontFamily: 'monospace' }}>{reg.backgroundColorHex}</strong></span>
                      {reg.isEstimate && <span style={{ color: '#d97706' }}>(Estimated)</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: reg.status === 'FAIL' ? '#dc2626' : '#10b981' }}>
                        {reg.contrastRatio}:1
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Contrast Ratio</div>
                    </div>

                    <span className={`pill ${reg.status === 'FAIL' ? 'pill-critical' : 'pill-verified'}`}>
                      {reg.status === 'FAIL' ? 'WCAG FAIL' : 'WCAG AA PASS'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TEXTUAL CLAIMS & EVIDENCE GOVERNANCE */}
        {activeTab === 'textual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Extracted Raw OCR Box */}
            <div style={{ padding: 14, background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={14} />
                  <span>Extracted OCR Text</span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence: {ocrConfidence}%</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-main)', fontStyle: 'italic', background: 'white', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                {extractedOcrText || '(No readable text detected)'}
              </div>
            </div>

            {/* Consolidated Findings List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {findings.map(finding => {
                const isSelected = finding.id === selectedFindingId;
                let sevClass = 'pill-warning';
                if (finding.severity === 'critical') sevClass = 'pill-critical';
                else if (finding.severity === 'verified') sevClass = 'pill-verified';
                else if (finding.severity === 'suggestion') sevClass = 'pill-neutral';

                return (
                  <div
                    key={finding.id}
                    onClick={() => {
                      if (finding.bbox) {
                        setSelectedFindingId(isSelected ? null : finding.id);
                      }
                    }}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? '#ef4444' : 'var(--border-color)'}`,
                      background: 'white',
                      boxShadow: isSelected ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'var(--shadow-sm)',
                      cursor: finding.bbox ? 'pointer' : 'default',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`pill ${sevClass}`} style={{ fontSize: 10.5, fontWeight: 700 }}>
                          {finding.severity.toUpperCase()}
                        </span>
                        <span className="pill pill-neutral" style={{ fontSize: 10.5 }}>
                          {finding.status}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                          {finding.relatedGuideline || finding.category}
                        </span>
                      </div>

                      {finding.bbox && (
                        <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
                          {isSelected ? 'Focused on Canvas ✓' : 'Click to Focus on Canvas 🔍'}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                      "{finding.detectedText}"
                    </div>

                    <div style={{ fontSize: 12.5, color: 'var(--text-sub)', marginBottom: 10 }}>
                      {finding.explanation}
                    </div>

                    {/* Suggested Compliant Correction */}
                    {finding.suggestedCorrection && (
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12
                      }}>
                        <div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: 2 }}>
                            Suggested Compliant Replacement
                          </div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)' }}>
                            "{finding.suggestedCorrection}"
                          </div>
                        </div>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(finding.suggestedCorrection!, finding.id);
                          }}
                          style={{ fontSize: 11, flexShrink: 0 }}
                        >
                          {copiedId === finding.id ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                          <span>{copiedId === finding.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: GEMINI VISION MULTIMODAL AUDIT INSIGHTS */}
        {activeTab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {geminiInsights ? (
              <>
                <div style={{ padding: 18, background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={14} style={{ color: '#2563eb' }} />
                      <span>Overall Creative Impression</span>
                    </span>
                    <span className="pill pill-primary" style={{ fontSize: 10.5 }}>
                      Model: {geminiInsights.modelUsed}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {geminiInsights.overallCreativeImpression}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {/* Contextual Observations */}
                  <div style={{ padding: 16, background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                      Contextual Visual Observations
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                      {geminiInsights.contextualObservations.map((obs, idx) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Improvements */}
                  <div style={{ padding: 16, background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                      Recommended Creative Improvements
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                      {geminiInsights.suggestedCreativeImprovements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Disclaimer Assessment */}
                <div style={{ padding: 14, background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                    Disclaimer Legibility & Placement Assessment
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-sub)' }}>
                    {geminiInsights.disclaimerPlacementAssessment}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                No AI Vision insights available for this asset.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
