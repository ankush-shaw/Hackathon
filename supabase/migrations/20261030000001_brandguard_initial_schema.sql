-- ==============================================================================
-- BRANDGUARD AI — PRODUCTION POSTGRESQL / SUPABASE SCHEMA
-- Entities: 17 normalized tables with Organization-level isolation & RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ORGANIZATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    industry TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERS (Role-Based Access: Admin, Editor, Reviewer)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Editor', 'Reviewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 4. BRAND GUIDELINES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('prohibited', 'trademark', 'evidence_required', 'tone_sla', 'disclaimer', 'visual', 'accessibility')),
    category_label TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'suggestion', 'verified')),
    description TEXT NOT NULL,
    match_pattern TEXT NOT NULL,
    is_regex BOOLEAN NOT NULL DEFAULT true,
    clarification_note TEXT,
    suggested_replacement TEXT,
    evidence_required BOOLEAN NOT NULL DEFAULT false,
    required_evidence_category TEXT,
    applicable_channels TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. GUIDELINE VERSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guideline_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    version_tag TEXT NOT NULL, -- e.g. 'v2.4'
    description TEXT,
    guidelines_snapshot JSONB NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. APPROVED & PROHIBITED TERMINOLOGY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approved_terminology (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('approved', 'prohibited', 'deprecated', 'preferred')),
    replacement_term TEXT,
    usage_guidance TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. BRAND ASSETS (Logos, Colors, Fonts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'color', 'font', 'guideline_document')),
    file_url TEXT,
    color_hex TEXT, -- For color assets (e.g. #2563EB)
    color_role TEXT, -- e.g. 'Primary', 'Secondary', 'Accent'
    font_family TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. EVIDENCE SOURCES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g. 'SLA-2025-V2'
    title TEXT NOT NULL,
    claim_or_fact TEXT NOT NULL,
    source_reference TEXT NOT NULL,
    category TEXT NOT NULL,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'unverified', 'disputed', 'expired')),
    notes TEXT,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. EVIDENCE DOCUMENTS (Uploaded Whitepapers, PDFs, TXT, DOCX)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_source_id UUID REFERENCES evidence_sources(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    extracted_text TEXT,
    processed_status TEXT NOT NULL CHECK (processed_status IN ('pending', 'extracted', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. CAMPAIGNS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    display_id TEXT NOT NULL, -- e.g. '#BG-8924'
    campaign_name TEXT NOT NULL,
    target_channel TEXT NOT NULL,
    headline TEXT,
    current_content TEXT NOT NULL,
    active_policy_version TEXT NOT NULL DEFAULT 'Acme Global 2025 v2.4',
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Submitted for Review', 'In Review', 'Action Required', 'Needs Evidence', 'Revision Requested', 'Approved', 'Rejected')),
    brand_health_score INTEGER NOT NULL DEFAULT 100,
    has_creative_asset BOOLEAN NOT NULL DEFAULT false,
    asset_file_name TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. CAMPAIGN REVISIONS (Snapshots of Content, Diffing & Scores)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    brand_health_score INTEGER NOT NULL,
    diff_summary JSONB, -- stores added words, removed words, modified claims
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. EXTRACTED CLAIMS (AI-Extracted Claims)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS extracted_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    revision_id UUID REFERENCES campaign_revisions(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    matched_text TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('performance', 'comparative', 'guarantee', 'security', 'pricing', 'product_capability', 'general')),
    start_index INTEGER NOT NULL,
    end_index INTEGER NOT NULL,
    requires_evidence BOOLEAN NOT NULL DEFAULT true,
    entities TEXT[] DEFAULT '{}',
    ai_confidence NUMERIC(4,3) NOT NULL DEFAULT 1.000,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. CLAIM VERIFICATIONS (The 5 Statuses: SUPPORTED, UNSUPPORTED, CONTRADICTED, EXPIRED, UNCERTAIN)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claim_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id UUID NOT NULL REFERENCES extracted_claims(id) ON DELETE CASCADE,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('SUPPORTED', 'UNSUPPORTED', 'CONTRADICTED', 'EXPIRED', 'UNCERTAIN')),
    matched_evidence_id UUID REFERENCES evidence_sources(id) ON DELETE SET NULL,
    explanation TEXT NOT NULL,
    supporting_excerpt TEXT,
    missing_information TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. COMPLIANCE ISSUES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES brand_guidelines(id) ON DELETE SET NULL,
    claim_id UUID REFERENCES extracted_claims(id) ON DELETE CASCADE,
    rule_code TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'suggestion', 'verified')),
    original_claim TEXT NOT NULL,
    matched_text TEXT NOT NULL,
    start_index INTEGER NOT NULL,
    end_index INTEGER NOT NULL,
    issue_description TEXT NOT NULL,
    clarification_note TEXT,
    evidence_reference TEXT,
    suggested_alternative TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'reviewed', 'applied', 'overridden')),
    override_reason TEXT,
    attached_evidence_id UUID REFERENCES evidence_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. REVIEW REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_reviewer UUID REFERENCES profiles(id) ON DELETE SET NULL,
    request_notes TEXT,
    urgency TEXT NOT NULL DEFAULT 'standard' CHECK (urgency IN ('low', 'standard', 'expedited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. REVIEW DECISIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_request_id UUID REFERENCES review_requests(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('Approved', 'Changes Requested', 'Rejected', 'Overridden')),
    decision_reason TEXT NOT NULL,
    conditions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 17. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_display_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    diff_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR HIGH-THROUGHPUT QUERIES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_guidelines_org ON brand_guidelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_evidence_org ON evidence_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_claims_campaign ON extracted_claims(campaign_id);
CREATE INDEX IF NOT EXISTS idx_issues_campaign ON compliance_issues(campaign_id);
CREATE INDEX IF NOT EXISTS idx_audit_campaign ON audit_logs(campaign_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_terminology ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Organization isolation helper
CREATE OR REPLACE FUNCTION user_in_org(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample RLS: Users can view campaigns in their organization
CREATE POLICY "Users can access org campaigns"
ON campaigns FOR ALL
USING (user_in_org(organization_id));

-- Users can access org brand guidelines
CREATE POLICY "Users can access org guidelines"
ON brand_guidelines FOR ALL
USING (user_in_org(organization_id));

-- Users can access org evidence sources
CREATE POLICY "Users can access org evidence"
ON evidence_sources FOR ALL
USING (user_in_org(organization_id));

-- Users can access org audit logs
CREATE POLICY "Users can access org audit logs"
ON audit_logs FOR ALL
USING (user_in_org(organization_id));

