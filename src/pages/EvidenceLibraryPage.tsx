import React, { useState } from 'react';
import type { EvidenceRecord } from '../types';
import { apiClient } from '../api/client';
import { 
  Plus, 
  X, 
  Search, 
  Upload, 
  FileText
} from 'lucide-react';

const TODAY_DATE_STR = new Date().toISOString().split('T')[0];

interface EvidenceLibraryPageProps {
  evidenceList: EvidenceRecord[];
  onAddEvidence: (record: EvidenceRecord) => void;
}

export const EvidenceLibraryPage: React.FC<EvidenceLibraryPageProps> = ({
  evidenceList,
  onAddEvidence,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // New Evidence Form State
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newClaim, setNewClaim] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newCategory, setNewCategory] = useState('Comparative Benchmark');
  const [newStatus, setNewStatus] = useState<'verified' | 'unverified' | 'disputed' | 'expired'>('verified');
  const [newNotes, setNewNotes] = useState('');
  const [newValidFrom, setNewValidFrom] = useState(TODAY_DATE_STR);
  const [newExpiration, setNewExpiration] = useState('');

  const filteredEvidence = evidenceList.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.claimOrFact.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClaim.trim()) return;

    const record: EvidenceRecord = {
      id: `EVID-CUSTOM-${Date.now()}`,
      code: newCode.trim() || `EVID-REV-${Math.floor(Math.random() * 900 + 100)}`,
      title: newTitle.trim(),
      claimOrFact: newClaim.trim(),
      sourceReference: newSource.trim() || 'Internal Corporate Repository Document',
      category: newCategory,
      verificationStatus: newStatus,
      notes: newNotes.trim() || 'Added via Evidence Library Manager.',
      validFrom: newValidFrom,
      expirationDate: newExpiration.trim() ? newExpiration.trim() : null,
      createdAt: new Date().toISOString()
    };

    onAddEvidence(record);
    setShowAddModal(false);
    // Reset
    setNewCode('');
    setNewTitle('');
    setNewClaim('');
    setNewSource('');
    setNewNotes('');
    setNewExpiration('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadMessage(null);

    try {
      const res = await apiClient.uploadEvidenceDocument(file);
      if (res && res.extractedRecord) {
        onAddEvidence(res.extractedRecord);
        setUploadMessage(`Successfully ingested "${file.name}"! Document added as ${res.extractedRecord.code} (Pending Approval).`);
      } else {
        setUploadMessage('Document processed.');
      }
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadLoading(false);
        setUploadMessage(null);
      }, 2000);
    } catch (err: any) {
      setUploadMessage(`Error parsing document: ${err.message}`);
      setUploadLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 className="page-title" style={{ margin: 0 }}>Approved Facts & Evidence Library</h1>
            <span className="pill pill-purple" style={{ fontSize: 11 }}>
              {evidenceList.length} Records Indexed
            </span>
          </div>
          <div className="page-subtitle" style={{ marginBottom: 0 }}>
            Central repository of validated product specifications, third-party benchmarks, SLAs, and ingested whitepapers.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowUploadModal(true)}
            id="btn-upload-document"
          >
            <Upload size={14} />
            <span>Upload Document (PDF / TXT)</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)} 
            id="btn-add-evidence"
          >
            <Plus size={15} />
            <span>Add Evidence Record</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ 
        background: 'white', 
        padding: '14px 20px', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid var(--border-color)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ position: 'relative', minWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 30, height: 36, fontSize: 13 }}
            placeholder="Search by code, title, or claim details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          Showing <strong>{filteredEvidence.length}</strong> of <strong>{evidenceList.length}</strong> evidence records
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredEvidence.map((record) => {
          let badgeClass = 'pill-verified';
          if (record.verificationStatus === 'unverified') badgeClass = 'pill-warning';
          if (record.verificationStatus === 'disputed' || record.verificationStatus === 'expired') badgeClass = 'pill-critical';

          const isExpired = record.verificationStatus === 'expired' || (record.expirationDate ? record.expirationDate < TODAY_DATE_STR : false);

          return (
            <div
              key={record.id}
              style={{
                background: 'white',
                border: isExpired ? '1px solid #fecaca' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="pill pill-neutral" style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>
                      {record.code}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
                      {record.title}
                    </span>
                    <span className={`pill ${badgeClass}`} style={{ fontSize: 10, textTransform: 'capitalize' }}>
                      ● {isExpired ? 'Expired' : record.verificationStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Category: <strong>{record.category}</strong> • Valid From: <strong>{record.validFrom || record.dateAdded || 'Active'}</strong>
                    {record.expirationDate && (
                      <span style={{ marginLeft: 8, color: isExpired ? '#b91c1c' : 'inherit' }}>
                        • Expiration: <strong>{record.expirationDate}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Substantiated claim or fact */}
              <div style={{ 
                background: isExpired ? '#fff5f5' : '#f8fafc', 
                padding: '12px 16px', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--border-color)',
                fontSize: 13,
                color: 'var(--text-main)',
                lineHeight: 1.5,
                marginBottom: 10
              }}>
                <strong>Approved Fact / Claim:</strong> {record.claimOrFact}
              </div>

              {/* Source & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12, color: 'var(--text-sub)' }}>
                <div>
                  <strong>Source Reference:</strong> {record.sourceReference}
                </div>
                <div>
                  <strong>Legal / Brand Notes:</strong> {record.notes || 'Documented in compliance repository.'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Upload size={18} style={{ color: 'var(--primary)' }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
                  Ingest Whitepaper / SLA Document
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowUploadModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 16 }}>
                Upload an official PDF benchmark, Gartner/IDC whitepaper, or contractual SLA text document.
                BrandGuard AI will parse the document text and extract validated claims for campaign verification.
              </p>

              {uploadMessage && (
                <div style={{ 
                  padding: '10px 14px', 
                  background: uploadMessage.includes('Error') ? '#fef2f2' : '#f0fdf4',
                  border: uploadMessage.includes('Error') ? '1px solid #fecaca' : '1px solid #bbf7d0',
                  borderRadius: 6,
                  color: uploadMessage.includes('Error') ? '#b91c1c' : '#047857',
                  fontSize: 13,
                  marginBottom: 16
                }}>
                  {uploadMessage}
                </div>
              )}

              <label className="dropzone-box" style={{ padding: '36px 20px', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={uploadLoading}
                />
                <div className="dropzone-icon">
                  <FileText size={24} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                  {uploadLoading ? 'Extracting text and parsing document...' : 'Click to select PDF or TXT file'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Accepts PDF or plain text up to 25MB
                </div>
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Evidence Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
                Add Evidence Record
              </div>
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEvidence}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Record Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. GARTNER-2025-MQ"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Comparative Benchmark">Comparative Benchmark</option>
                      <option value="SLA & Architecture">SLA & Architecture</option>
                      <option value="Product Nomenclature">Product Nomenclature</option>
                      <option value="Security & Compliance">Security & Compliance</option>
                      <option value="Performance Benchmark">Performance Benchmark</option>
                      <option value="Technical Whitepaper">Technical Whitepaper</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2025 Cloud Database Speed Benchmark by TechAnalyst Group"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Approved Fact / Claim Definition</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Exact validated fact supported by documentation..."
                    value={newClaim}
                    onChange={(e) => setNewClaim(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Source Reference</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Master Service Agreement v2.4, Appendix D"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                    >
                      <option value="verified">Verified (Active)</option>
                      <option value="unverified">Unverified (Pending)</option>
                      <option value="expired">Expired</option>
                      <option value="disputed">Disputed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Valid From</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newValidFrom}
                      onChange={(e) => setNewValidFrom(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expiration Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newExpiration}
                      onChange={(e) => setNewExpiration(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Legal / Compliance Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Valid for all enterprise ad variants through Q4 2026."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Evidence Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
