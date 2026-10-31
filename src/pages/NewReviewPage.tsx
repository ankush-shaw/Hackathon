import React, { useState } from 'react';
import type { BrandRule, EvidenceRecord, CreativeAnalysisResult } from '../types';
import { apiClient } from '../api/client';
import { CreativeComplianceReportView } from '../components/creative/CreativeComplianceReportView';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  RotateCcw, 
  AlertCircle,
  Layers,
  Eye,
  Loader2
} from 'lucide-react';

interface NewReviewPageProps {
  rules: BrandRule[];
  evidenceList: EvidenceRecord[];
  onScanComplete: (newReviewId: string) => void;
}

export const NewReviewPage: React.FC<NewReviewPageProps> = ({
  onScanComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [campaignName, setCampaignName] = useState('Q4 Cloud Launch - Enterprise Tier');
  const [targetChannel, setTargetChannel] = useState('LinkedIn Ad');
  const [headline, setHeadline] = useState('Are cloud bottlenecks slowing your engineering sprint cycles?');
  const [copyText, setCopyText] = useState(
    'Boost your enterprise productivity by 10x guaranteed with Acme Cloud Platform. Voted #1 fastest cloud database in North America without downtime!'
  );
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; raw?: File } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [creativeAnalysis, setCreativeAnalysis] = useState<CreativeAnalysisResult | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisStep, setImageAnalysisStep] = useState('');
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live word and character counters
  const words = copyText.trim().split(/\s+/).filter(Boolean).length;
  const chars = copyText.length;

  const handleClear = () => {
    setCopyText('');
  };

  const handleLoadSample = (type: 'flagged' | 'clean' | 'long' | 'slide') => {
    if (type === 'slide') {
      setCampaignName('Platform Launch - Slide 1 & 3 Demo');
      setTargetChannel('LinkedIn Ad');
      setHeadline('Trust Every Brand Message');
      setCopyText(
        'Introducing our new platform. It is unequivocally the fastest on the market.'
      );
    } else if (type === 'flagged') {
      setCampaignName('Q4 Cloud Launch - Enterprise Tier');
      setTargetChannel('LinkedIn Ad');
      setHeadline('Are cloud bottlenecks slowing your engineering sprint cycles?');
      setCopyText(
        'Boost your enterprise productivity by 10x guaranteed with Acme Cloud Platform. Voted #1 fastest cloud database in North America without downtime!'
      );
    } else if (type === 'long') {
      setCampaignName('Global Enterprise Scaling');
      setTargetChannel('LinkedIn Ad');
      setHeadline('Are cloud bottlenecks slowing your engineering sprint cycles?');
      setCopyText(
        'Deploy the Acme Cloud Platform today and boost your enterprise productivity by 10x guaranteed. Engineered as the voted #1 fastest cloud database in North America, our distributed clusters eliminate failover friction. With our patented zero scheduled downtime architecture, global teams experience uninterrupted operations at planetary scale.'
      );
    } else {
      setCampaignName('Autonomous Analytics - Product Tour');
      setTargetChannel('Google Search Ad');
      setHeadline('Accelerate Enterprise Data Pipeline Performance');
      setCopyText(
        'Accelerate enterprise data analytics with validated sub-5ms query latency and planetary scale using Acme CloudSphere™ high-availability clusters.'
      );
    }
    setErrorMsg('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Uploaded creative asset exceeds 25MB limit.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadedFile({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      raw: file
    });
    setErrorMsg('');
    setIsAnalyzingImage(true);
    setImageAnalysisStep('Extracting OCR text & analyzing pixels with Sharp...');

    try {
      // 1. Run Real Image Analysis (Sharp pixels, Tesseract OCR, WCAG contrast, Gemini Vision)
      const result = await apiClient.uploadAndAnalyzeCreative(file, targetChannel);
      setCreativeAnalysis(result);

      // 2. Auto-populate ad copy if currently empty
      if (!copyText.trim() && result.extractedOcrText) {
        setCopyText(result.extractedOcrText);
      }

      setIsAnalyzingImage(false);
      setImageAnalysisStep('');
    } catch (err: any) {
      console.error('Creative Compliance scan failed:', err);
      setIsAnalyzingImage(false);
      setImageAnalysisStep('');
      setErrorMsg(`Creative Analysis Notice: ${err.message || 'Server processed with standard inspection'}`);
    }
  };

  const handleRunScan = async () => {
    if (!campaignName.trim()) {
      setErrorMsg('Please specify a Campaign Name.');
      return;
    }
    if (!copyText.trim() && !creativeAnalysis?.extractedOcrText) {
      setErrorMsg('Please enter advertisement copy text or upload a creative with readable text.');
      return;
    }

    setIsScanning(true);
    setErrorMsg('');

    try {
      const createdCampaign = await apiClient.createCampaign({
        campaignName: campaignName.trim(),
        channel: targetChannel,
        headline: headline.trim() || undefined,
        content: copyText.trim() || creativeAnalysis?.extractedOcrText || 'Creative Banner Asset',
        assetFileName: uploadedFile ? uploadedFile.name : undefined,
        assetFileUrl: creativeAnalysis?.assetFileUrl || previewUrl || undefined,
        creativeAnalysis: creativeAnalysis || undefined
      });

      setIsScanning(false);
      onScanComplete(createdCampaign.id);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMsg(err.message || 'Failed to complete compliance scan.');
    }
  };

  return (
    <div className="page-container">
      {/* Page Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">Review your content</h1>
        <div className="page-subtitle">
          Evaluate marketing copy and campaign assets against brand guidelines, evidence repository, and FTC requirements.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        <button
          className={`filter-tab ${activeTab === 'text' ? 'active' : ''}`}
          style={{ 
            padding: '10px 18px', 
            borderBottom: activeTab === 'text' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: activeTab === 'text' ? 'var(--primary)' : 'var(--text-sub)'
          }}
          onClick={() => setActiveTab('text')}
        >
          <FileText size={16} />
          <span>Copy & Evidence Scan</span>
        </button>

        <button
          className={`filter-tab ${activeTab === 'image' ? 'active' : ''}`}
          style={{ 
            padding: '10px 18px', 
            borderBottom: activeTab === 'image' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: activeTab === 'image' ? 'var(--primary)' : 'var(--text-sub)'
          }}
          onClick={() => setActiveTab('image')}
        >
          <ImageIcon size={16} />
          <span>Creative Asset & Accessibility</span>
        </button>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          color: '#b91c1c', 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-sm)', 
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13 
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Layout */}
      <div className="review-form-layout">
        {/* Left Column: Form Details */}
        <div className="review-form-card">
          {/* Quick Test Templates */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '10px 14px', 
            background: '#f8fafc', 
            borderRadius: 'var(--radius-sm)', 
            marginBottom: 20,
            border: '1px solid var(--border-color)' 
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)' }}>
              Quick Test Templates:
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => handleLoadSample('slide')}
                title="Load exact example from presentation slides 1 & 3"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 600 }}
              >
                PPT Slide Demo
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => handleLoadSample('flagged')}
                title="Load sample copy with absolute guarantee, unverified claim, and tone flag"
              >
                Sample Ad (Flagged)
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => handleLoadSample('long')}
                title="Load full multi-sentence enterprise copy"
              >
                Enterprise Copy
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => handleLoadSample('clean')}
                title="Load 100% compliant ad with approved nomenclature"
              >
                Compliant Ad (Pass)
              </button>
            </div>
          </div>

          {/* Row 1: Campaign Name & Target Channel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="form-label">Campaign Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Q4 Cloud Launch"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                id="input-campaign-name"
                required
              />
            </div>

            <div>
              <label className="form-label">Target Distribution Channel</label>
              <select
                className="form-select"
                value={targetChannel}
                onChange={(e) => setTargetChannel(e.target.value)}
                id="select-channel"
              >
                <option value="LinkedIn Ad">LinkedIn Ad (B2B Sponsored Feed)</option>
                <option value="Google Search Ad">Google Search Ad (PPC Headline)</option>
                <option value="Twitter / X Post">Twitter / X Post (Organic & Paid)</option>
                <option value="Meta Ad">Meta Ad (Facebook / Instagram Feed)</option>
                <option value="Email Newsletter">Email Newsletter / Outreach</option>
              </select>
            </div>
          </div>

          {/* Row 2: Headline */}
          <div style={{ marginBottom: 20 }}>
            <div className="form-label-row">
              <label className="form-label">Ad Headline (Optional)</label>
              <span className="form-hint">Used for disclaimer positioning</span>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Accelerate your enterprise data workflows"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              id="input-headline"
            />
          </div>

          {/* Row 3: Marketing Copy */}
          <div>
            <div className="form-label-row">
              <label className="form-label">Marketing Ad Copy</label>
              <span className="form-hint">Paste full body copy to verify against evidence</span>
            </div>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="Paste copy here..."
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
              id="textarea-ad-copy"
              required
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <span>{words} words</span> • <span>{chars} characters</span>
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm"
                onClick={handleClear}
                style={{ fontSize: 11.5 }}
              >
                <RotateCcw size={12} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Scan Action */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary"
              onClick={handleRunScan}
              disabled={isScanning}
              style={{ minWidth: 200, padding: '10px 20px', fontSize: 14 }}
              id="btn-run-compliance-scan"
            >
              <Sparkles size={16} />
              <span>{isScanning ? 'Evaluating Claims & Evidence...' : 'Run Compliance Scan'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Creative Asset & Inspection */}
        <div className="review-form-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="form-label-row" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ImageIcon size={16} style={{ color: 'var(--primary)' }} />
              <span className="form-label">Creative Asset Inspection</span>
            </div>
            <span className="form-hint">Optional</span>
          </div>

          {isAnalyzingImage ? (
            <div style={{
              background: '#f8fafc',
              border: '2px dashed #93c5fd',
              borderRadius: 'var(--radius-md)',
              padding: 32,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 12
            }}>
              <Loader2 size={32} className="spinning-loader" style={{ color: '#2563eb' }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                  Auditing Creative Compliance...
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {imageAnalysisStep || 'Sharp pixel analysis, Tesseract OCR & Gemini Vision...'}
                </div>
              </div>
            </div>
          ) : uploadedFile ? (
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: 16, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              {/* Image Preview Thumbnail */}
              {previewUrl && (
                <div style={{
                  width: '100%',
                  maxHeight: 180,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#0f172a',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={previewUrl}
                    alt={uploadedFile.name}
                    style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {uploadedFile.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {uploadedFile.size}
                  </div>
                </div>

                {creativeAnalysis && (
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: creativeAnalysis.scores.overallCreativeScore >= 80 ? '#ecfdf5' : '#fffbeb',
                    border: `1px solid ${creativeAnalysis.scores.overallCreativeScore >= 80 ? '#a7f3d0' : '#fde68a'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: creativeAnalysis.scores.overallCreativeScore >= 80 ? '#065f46' : '#92400e' }}>
                      Score: {creativeAnalysis.scores.overallCreativeScore}/100
                    </span>
                  </div>
                )}
              </div>

              {/* Real Creative Analysis Highlights Card */}
              {creativeAnalysis && (
                <div style={{ 
                  width: '100%', 
                  background: 'white', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 6, 
                  padding: 12, 
                  textAlign: 'left',
                  fontSize: 12,
                  marginBottom: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  {/* Dominant Colors Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dominant Colors:</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {creativeAnalysis.visualAnalysis.colorCompliance.dominantColors.slice(0, 5).map((swatch, i) => (
                        <div
                          key={i}
                          title={`${swatch.hex} (${swatch.percentage}%) - ${swatch.isApprovedBrandColor ? 'Approved' : 'Unapproved'}`}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: swatch.hex,
                            border: `1.5px solid ${swatch.isApprovedBrandColor ? 'rgba(0,0,0,0.2)' : '#ef4444'}`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Contrast and OCR Summary */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-muted)' }}>WCAG Contrast:</span>
                    <span style={{ 
                      fontWeight: 700, 
                      color: creativeAnalysis.visualAnalysis.contrastCompliance.wcagAARate >= 80 ? '#10b981' : '#f59e0b' 
                    }}>
                      {creativeAnalysis.visualAnalysis.contrastCompliance.wcagAARate}% AA Pass ({creativeAnalysis.visualAnalysis.contrastCompliance.passCount}P/{creativeAnalysis.visualAnalysis.contrastCompliance.failCount}F)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Extracted Text:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {creativeAnalysis.textBlocks.length} blocks ({creativeAnalysis.ocrConfidence}% conf.)
                    </span>
                  </div>

                  {/* Button to populate copy from OCR */}
                  {creativeAnalysis.extractedOcrText && copyText !== creativeAnalysis.extractedOcrText && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setCopyText(creativeAnalysis.extractedOcrText)}
                      style={{ fontSize: 11, padding: '4px 8px', marginTop: 4, width: '100%', justifyContent: 'center' }}
                    >
                      <FileText size={12} />
                      <span>Use Extracted OCR Text in Ad Copy</span>
                    </button>
                  )}

                  {/* Button to open interactive report modal */}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowCreativeModal(true)}
                    style={{ fontSize: 11.5, padding: '6px 10px', marginTop: 2, width: '100%', justifyContent: 'center' }}
                  >
                    <Eye size={13} />
                    <span>View Interactive Creative Audit</span>
                  </button>
                </div>
              )}

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setUploadedFile(null);
                  setPreviewUrl(null);
                  setCreativeAnalysis(null);
                }}
                style={{ fontSize: 11 }}
              >
                <X size={12} />
                <span>Remove Asset</span>
              </button>
            </div>
          ) : (
            <label className="dropzone-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div className="dropzone-icon">
                <Upload size={20} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                Upload creative advertisement image
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                PNG, JPG, JPEG, or WEBP up to 25MB
              </div>
              <div style={{ fontSize: 11, color: '#2563eb', marginTop: 8, fontWeight: 600 }}>
                Automatic Sharp Pixel, Tesseract OCR & Gemini Vision Analysis
              </div>
            </label>
          )}

          <div style={{ marginTop: 16, fontSize: 11.5, color: '#64748b', lineHeight: 1.5 }}>
            🛡️ Inspects pixel palettes, WCAG relative luminance contrast, text bounding boxes, and claims.
          </div>
        </div>
      </div>

      {/* Full-Screen Creative Compliance Report Modal */}
      {showCreativeModal && creativeAnalysis && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 24
        }}>
          <div style={{
            background: '#f8fafc',
            width: '100%',
            maxWidth: 1060,
            maxHeight: '92vh',
            borderRadius: 'var(--radius-lg)',
            overflowY: 'auto',
            padding: 24,
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border-color)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Interactive Creative Compliance Audit
                </h3>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCreativeModal(false)}
              >
                <X size={15} />
                <span>Close</span>
              </button>
            </div>

            <CreativeComplianceReportView report={creativeAnalysis} />
          </div>
        </div>
      )}
    </div>
  );
};
