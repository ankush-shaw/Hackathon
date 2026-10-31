# BrandGuard AI — AI-Powered Brand Governance & Marketing Compliance Platform

<div align="center">

![BrandGuard AI Banner](https://img.shields.io/badge/BrandGuard%20AI-Production%20Governance%20Platform-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express%205-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vitest Tests](https://img.shields.io/badge/Vitest%20Tests-12%2F12%20Passed-success?style=for-the-badge)

**An evidence-backed, AI-powered brand governance and automated marketing content compliance platform engineered for modern enterprise scale.**

[Architecture](#-system-architecture--how-it-works) • [Core Capabilities](#-core-capabilities) • [API & Database Schema](#-database-schema--api-architecture) • [Getting Started](#-getting-started-locally) • [Demo Walkthrough](#-hackathon-demo-script--walkthrough)

</div>

---

## 📖 Executive Summary: Why BrandGuard AI?

In hyper-growth enterprises, marketing and growth teams publish hundreds of ad variants, social updates, search snippets, and landing pages across dozens of channels every week. Meanwhile, brand standards, legal disclaimers, and technical product claims are buried in static PDF guidelines or outdated wiki pages.

This disconnect creates severe friction:
- **High-Velocity vs. High-Risk:** Moving fast often leads to unsubstantiated superlative claims (e.g., *"#1 fastest cloud database"*), illegal performance guarantees (*"10x guaranteed"*), or obsolete product naming.
- **The Legal Bottleneck:** Legal and compliance reviews are manual, slow, and expensive, delaying critical campaign launches by days or weeks.
- **Brand Dilution & Hallucinated Claims:** Inconsistent messaging, unapproved terminology, and unverified performance metrics erode customer trust and enterprise credibility.

**BrandGuard AI bridges this gap.** It acts as an automated, continuous compliance copilot that sits between creative drafting and public distribution—validating marketing copy against approved brand guidelines, technical SLAs, and substantiating evidence records in milliseconds.

---

## ⚙️ System Architecture & How It Works

BrandGuard AI combines **deterministic rule-based compliance** with **semantic AI claim intelligence** via Google Gemini, supported by a dual-mode persistent backend:

```mermaid
flowchart TD
    Client[React 19 + TypeScript SPA Client] -->|REST API Requests| API[Express 5 + TypeScript Backend API]
    
    subgraph Backend Engine Pipeline
        API --> Engine[Hybrid Compliance Engine]
        Engine --> Rules[Deterministic Regex Rules Engine]
        Engine --> Extractor[Gemini AI Claim Extractor]
        Engine --> Verifier[Gemini Semantic Claim Verifier]
        Engine --> Drift[Word-Level Campaign Drift Detector]
        Engine --> Accessibility[WCAG Color Contrast & Alt Text Linter]
    end

    subgraph Data & Document Pipeline
        API --> DocParser[Document Parser: PDF & TXT Extractor]
        DocParser --> Evidence[Evidence Library & Expiration Tracker]
        API --> Storage[Dual-Mode Data Store]
        Storage -->|Production| Supabase[Supabase PostgreSQL + RLS]
        Storage -->|Offline / Local| LocalStore[Resilient Memory & Storage Fallback]
    end

    subgraph Verification Output
        Verifier --> Statuses[5 Verification Statuses: Supported | Unsupported | Contradicted | Expired | Uncertain]
        Rules --> Severity[Rule Findings: Critical | Warning | Suggestion]
        Drift --> TextDiff[Added / Removed Diff Tokens & Score Shift]
    end

    Statuses & Severity & TextDiff --> Client
```

### The Three Pillars:
1. **VERIFY:** Break submitted marketing copy into discrete factual claims and verify each claim against approved whitepapers, benchmarks, and SLAs.
2. **MONITOR:** Detect prohibited guarantees, trademark nomenclature violations, tone drift, and expired evidence over time.
3. **APPROVE:** Provide an auditable human review workflow with reviewer decisions, change requests, and immutable audit logs.

---

## 🚀 Core Capabilities

### 1. 🤖 Gemini AI Claim Extraction & Semantic Verification
- **Claim Extraction:** Extracts atomic factual assertions from marketing copy (percentages, comparative claims, performance metrics, SLAs).
- **Claim-to-Evidence Matching:** Evaluates claims against the indexed Evidence Library and assigns one of **5 explicit verification statuses**:
  - `SUPPORTED`: Claim is directly corroborated by active evidence.
  - `UNSUPPORTED`: No corroborating evidence exists in the repository.
  - `CONTRADICTED`: Available evidence directly disputes the claim.
  - `EXPIRED`: Previously valid evidence has passed its expiration date.
  - `UNCERTAIN`: Ambiguous or unquantifiable assertion.
- **Server-Side Security:** Gemini API keys are maintained strictly server-side, never exposed to client bundles.

### 2. ⚡ Deterministic Brand Rule Enforcement
- Fast, predictable pattern evaluation for regulatory and trademark rules:
  - **Prohibited Guarantees (Critical):** Unqualified promises (*"10x guaranteed"*).
  - **Comparative Superlatives (Warning):** Unsubstantiated claims (*"voted #1 fastest"*).
  - **Trademark Nomenclature (Suggestion):** Deprecated brand names (*"Acme Cloud Platform"* → *"Acme CloudSphere™"*).
  - **Tone & SLA Clarity (Suggestion):** Casual claims (*"without downtime"* → *"99.99% uptime availability"*).
- **Rule Baseline Versioning:** Publish and switch between guideline baselines (`v2.4`, `v2.5`).

### 3. 📄 Evidence Document Ingestion & Expiration Tracking
- **Multi-Format Upload:** Ingest PDF whitepapers (via `pdf-parse`) and TXT documents.
- **Automated Text Extraction:** Parses uploaded documents and stores them as active evidence records with title, source, and extracted text.
- **Temporal Validity:** Tracks `validFrom` and `expirationDate` on every evidence record; expired evidence automatically triggers an `EXPIRED` status on linked claims.

### 4. 🔄 Campaign Revision Drift & Text Diffing
- Real word-level text diffing between campaign revisions using the `diff` library.
- Highlights added words, removed words, and score changes from draft to draft.

### 5. 👥 Human-in-the-Loop Review Workflow
- **Role-Based Workflows:** Supports `creator`, `manager`, and `reviewer` personas.
- **Decisions:** Formal `approved`, `rejected`, and `revision_requested` actions.
- **Audit Logging:** Every scan, rule toggle, override, and review decision is captured in the database audit log.

### 6. 🎨 Brand Visual Identity & WCAG 2.1 Accessibility
- **Color Contrast Math:** Calculates luminance and relative contrast ratios, testing against WCAG AA (4.5:1) and AAA (7:1) guidelines.
- **Asset Metadata & Alt-Text Linting:** Audits marketing creatives for dimensions, file size, missing alt text, and unapproved color values. (No fake OCR—honestly labeled file and palette inspection).

---

## 🗄️ Database Schema & API Architecture

### Database Migration: 17 Normalized Entities
The Supabase PostgreSQL migration located at [`supabase/migrations/20261030000001_brandguard_initial_schema.sql`](supabase/migrations/20261030000001_brandguard_initial_schema.sql) defines:

1. `profiles` — User profile, role, avatar
2. `organizations` — Multi-tenant organization boundaries
3. `organization_members` — Tenant membership with roles (`creator`, `manager`, `reviewer`)
4. `brand_guidelines` — Top-level guidelines
5. `guideline_versions` — Versioned rulesets (`v2.4`, `v2.5`)
6. `brand_rules` — Individual deterministic compliance rules
7. `approved_terminology` — Approved glossary terms and forbidden phrases
8. `brand_assets` — Approved visual logos, palettes, typography
9. `evidence_sources` — Official citation sources
10. `evidence_documents` — Raw uploaded PDF/TXT files with extracted text
11. `evidence_records` — Granular evidence records with temporal validity
12. `campaigns` — Marketing campaigns under review
13. `campaign_revisions` — Revision snapshots with word diff tracking
14. `extracted_claims` — Atomic factual statements extracted from copy
15. `claim_verifications` — AI semantic verifications against evidence
16. `review_decisions` — Human reviewer sign-offs and change requests
17. `audit_logs` — Immutable audit log of all system actions

### REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, Gemini & Supabase integration flags |
| `GET` | `/api/campaigns` | List all campaigns and historical reviews |
| `POST` | `/api/campaigns/scan` | Execute hybrid compliance scan (Deterministic + Gemini AI) |
| `POST` | `/api/campaigns/:id/revisions` | Submit campaign revision and compute word-level drift |
| `GET` | `/api/guidelines` | List all brand rules and version baseline |
| `PUT` | `/api/guidelines/:id` | Update rule parameters or toggle active status |
| `POST` | `/api/guidelines/publish` | Publish a new guideline baseline version snapshot |
| `GET` | `/api/evidence` | List evidence library records with validity status |
| `POST` | `/api/evidence` | Create manual evidence record with expiration date |
| `POST` | `/api/evidence/upload` | Upload PDF or TXT file with automated text extraction |
| `POST` | `/api/reviews/:id/decision` | Record human review decision (`approved`, `rejected`, etc.) |
| `POST` | `/api/reviews/:id/override` | Log compliance finding override with rationale |
| `GET` | `/api/analytics/dashboard` | Aggregated compliance metrics and audit trail |

---

## 🧪 Automated Unit & Integration Tests

BrandGuard AI includes a 12-test automated Vitest suite verifying both deterministic rule matching and hybrid AI claim verification:

```bash
npm test
```

### Verified Test Suites:
- **`src/engine/complianceEngine.test.ts` (6 tests):**
  - Prohibited guarantee detection (`Policy 4.2`).
  - Superlative claim detection (`FTC Compliance`).
  - Approved SLA evidence recognition (`SLA-2025-V2`).
  - Index-safe single and batch string replacement.
  - Active/inactive rule toggle honoring.
- **`src/engine/hybridVerification.test.ts` (6 tests):**
  - Verification of `SUPPORTED` claims against evidence.
  - Flagging `CONTRADICTED` claims when benchmarks conflict.
  - Marking `UNSUPPORTED` claims when citations are missing.
  - Detection of `EXPIRED` evidence based on validity dates.
  - Revision drift diffing with added/removed token accounting.
  - WCAG contrast calculation (AA/AAA pass/fail).

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/arpanbasak90-cyber/Codex-48.git
cd Codex-48

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your keys (optional for local demo; the system includes resilient mock fallbacks for all external services):
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Run Development Services
Start both backend API server and Vite frontend:
```bash
# Terminal 1: Run Express Backend
npm run server

# Terminal 2: Run Vite Frontend
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser. (The Express API will be accessible on `http://localhost:5000`).

### 5. Production Build & Linting
```bash
# Run strict linter (oxlint)
npm run lint

# Run automated tests
npm test

# Build production bundle
npm run build
```

---

## 🎬 Hackathon Demo Script & Walkthrough

1. **Preset Evaluation:**
   - Go to **New Review**.
   - Click **"Load Sample Ad (Flagged)"** — pre-populates copy with critical guarantees (*"10x guaranteed"*), comparative rankings (*"#1 fastest"*), and unapproved product names.
   - Click **"Run Compliance Scan"**.
2. **Explore AI Claim Intelligence:**
   - In **Analysis Results**, view the **AI Extracted Claims** tab.
   - See how each factual claim was extracted and assigned a status (`UNSUPPORTED`, `CONTRADICTED`, `EXPIRED`, `SUPPORTED`).
3. **One-Click Fixes & Score Recovery:**
   - In the **Deterministic Findings** tab, click **"Apply Fix"** on *"Acme Cloud Platform"*.
   - Watch the copy automatically update to *"Acme CloudSphere™"* with an instant score recalculation.
4. **Inspect Revision Drift:**
   - Switch to the **Revision Drift** tab to see word-level diffs showing what was added and removed between drafts.
5. **PDF Document Ingestion:**
   - Navigate to **Evidence Library**.
   - Click **"Upload Document"** and select a PDF or TXT whitepaper.
   - Watch the server extract text, record validity dates, and immediately index it into the active knowledge base.
6. **Human Sign-Off & Audit Trail:**
   - Return to the scan results, click **"Approve Ad"** with review notes.
   - Check the **Dashboard** to see the updated compliance health metrics and immutable audit log entry.

---

## 📄 License & Credits

Built for the **DevNexus 2.0 / CODEX 48 Hackathon**.  
Designed with inspiration from modern enterprise brand governance workflows and the Stitch design system.
