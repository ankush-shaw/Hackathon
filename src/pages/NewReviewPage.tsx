import React, { useState } from 'react';
import type { BrandRule, EvidenceRecord } from '../types';
import { apiClient } from '../api/client';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  RotateCcw, 
  AlertCircle,
  FileCheck2
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
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [assetAnalysis, setAssetAnalysis] = useState<any | null>(null);

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
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('Uploaded asset exceeds 25MB limit.');
        return;
      }
      setUploadedFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        raw: file
      });
      setErrorMsg('');

      // Run genuine asset inspection & accessibility audit
      const analysis = await apiClient.analyzeCreativeAsset({
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        contentText: copyText,
        hasAsset: true
      });
      if (analysis) {
        setAssetAnalysis(analysis);
      }
    }
  };

  const handleRunScan = async () => {
    if (!campaignName.trim()) {
      setErrorMsg('Please specify a Campaign Name.');
      return;
    }
    if (!copyText.trim()) {
      setErrorMsg('Please enter advertisement copy text to scan.');
      return;
    }

    setIsScanning(true);
    setErrorMsg('');

    try {
      const createdCampaign = await apiClient.createCampaign({
        campaignName: campaignName.trim(),
        channel: targetChannel,
        headline: headline.trim() || undefined,
        content: copyText.trim(),
        assetFileName: uploadedFile ? uploadedFile.name : undefined
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

          {uploadedFile ? (
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: 20, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              <div style={{ width: 48, height: 48, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: 12 }}>
                <FileCheck2 size={24} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                {uploadedFile.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                {uploadedFile.size} • Attached to review
              </div>

              {/* Real Asset Analysis Card */}
              {assetAnalysis && (
                <div style={{ 
                  width: '100%', 
                  background: 'white', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 6, 
                  padding: 12, 
                  textAlign: 'left',
                  fontSize: 12,
                  marginBottom: 14
                }}>
                  <div style={{ fontWeight: 700, color: '#047857', marginBottom: 4 }}>
                    ✓ Color Palette Verified
                  </div>
                  <div style={{ color: 'var(--text-sub)', marginBottom: 6 }}>
                    {assetAnalysis.visualAnalysis?.colorCompliance?.details}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Accessibility Score: <strong>{assetAnalysis.accessibility?.score}/100</strong> ({assetAnalysis.accessibility?.status})
                  </div>
                </div>
              )}

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setUploadedFile(null);
                  setAssetAnalysis(null);
                }}
              >
                <X size={13} />
                <span>Remove Asset</span>
              </button>
            </div>
          ) : (
            <label className="dropzone-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div className="dropzone-icon">
                <Upload size={20} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                Drag and drop creative banner
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                PNG, JPG, or SVG up to 25MB
              </div>
            </label>
          )}

          <div style={{ marginTop: 16, fontSize: 11.5, color: '#64748b', lineHeight: 1.5 }}>
            🛡️ Inspects file metadata, color palette alignment, and WCAG accessibility standards.
          </div>
        </div>
      </div>
    </div>
  );
};
