# Alumni Portal Master Technical Documentation

Welcome to the definitive engineering and operational documentation for the Alumni Portal. 
This document serves as the single source of truth for the system's architecture, data modeling, API specifications, and infrastructure pipelines. 

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Comprehensive Directory Structure](#4-comprehensive-directory-structure)
5. [Primary System Workflows](#5-primary-system-workflows)
   - [5.1 Registration & Onboarding](#51-registration--onboarding)
   - [5.2 Authentication & Authorization](#52-authentication--authorization)
   - [5.3 Mentorship & Networking](#53-mentorship--networking)
   - [5.4 Scholarship & Financial Disbursal](#54-scholarship--financial-disbursal)
   - [5.5 Job Board & Career Services](#55-job-board--career-services)
   - [5.6 Admin Support Queue](#56-admin-support-queue)
6. [Comprehensive Database Architecture](#6-comprehensive-database-architecture)
   - [6.1 Global ER Diagram](#61-global-er-diagram)
   - [6.2 Detailed Table Schemas](#62-detailed-table-schemas)
7. [API Reference & Contracts](#7-api-reference--contracts)
8. [Security & Compliance](#8-security--compliance)
9. [Deployment & Infrastructure](#9-deployment--infrastructure)
10. [Environment Variables](#10-environment-variables)
11. [Testing & Quality Assurance](#11-testing--quality-assurance)
12. [Contribution Guidelines](#12-contribution-guidelines)
13. [Glossary & Terminology](#13-glossary--terminology)

---

## 1. Executive Summary

The Alumni Portal is a highly scalable, role-based platform designed to orchestrate all community interactions between alumni, students, and administrators. 
It segregates operational boundaries into three distinct contexts:
1. **Public Domain:** Marketing, public directories, and SEO-optimized informational landing pages.
2. **User Workspace:** A gated, authenticated dashboard for networking, finding mentors, accessing job boards, and managing specific alumni profiles.
3. **Admin Workspace:** A highly secure, analytics-driven control center for verifying identities, disbursing funds, configuring platform settings, and viewing telemetry.

This project is built to accommodate heavy read-workloads (directories, job boards) and high-consistency write workloads (financial commitments, support requests).

---

## 2. System Architecture

The ecosystem relies on an edge-optimized framework where static assets and general layouts are cached, while operational workflows operate on strictly authenticated dynamic routes.

### 2.1 Macro Architecture Model

```mermaid
flowchart TD
    subgraph Client Tier
        Browser(Web Browser / Mobile Client)
    end

    subgraph CDN & Edge
        VercelEdge[Vercel Edge Network]
        Middleware(Next.js Middleware `proxy.ts`)
    end

    subgraph Application Tier
        NextApp(Next.js App Server)
        AdminContext[Admin Module]
        UserContext[User Module]
        PublicContext[Public Module]
        NextApp --> AdminContext
        NextApp --> UserContext
        NextApp --> PublicContext
    end

    subgraph Data & Service Tier
        PgNode[(PostgreSQL Primary)]
        RedisCache[(Redis Session Cache)]
        BlobStore[S3 Compatible Object Store)
    end

    Browser -->|HTTPS| VercelEdge
    VercelEdge --> Middleware
    Middleware -->|Validate Context| NextApp
    AdminContext --> PgNode
    UserContext --> PgNode
    PublicContext --> RedisCache
```

---

## 3. Technology Stack

### Frontend & Core Application
- **Framework:** Next.js 16.1.1 (App Router exclusively)
- **Library:** React 19.2.3
- **Language:** TypeScript 5.0+ (Strict Type Checking)
- **Styling:** Tailwind CSS v4
- **Components:** Radix UI primitives & Lucide React (Icons)
- **State Management:** React Context + Hooks (targeting Zustand for complex client stores)

### Backend & Infrastructure (Target)
- **API Strategy:** Next.js Route Handlers (RESTful)
- **Database:** PostgreSQL (Relational mapping for entities)
- **ORM:** Prisma or Drizzle ORM (for schema synchronization and migrations)
- **Caching:** Redis (Rate limiting, Session validation)
- **Auth Provider:** NextAuth/Auth.js or custom JWT with HttpOnly cookies
- **File Storage:** AWS S3 or MinIO (Profile pictures, Resumes)

---


## 4. Comprehensive Directory Structure

Below is an exhaustive breakdown of the current workspace directory, outlining module concerns.

```text
/alumni-portal/
├── eslint.config.mjs               # Central ESLint configuration and rule definitions
├── next.config.ts                  # Webpack, image domains, and Next.js compiler directives
├── package.json                    # Project dependencies and script declarations
├── postcss.config.mjs              # PostCSS plugins (typically tailwind wrappers)
├── proxy.ts                        # Crucial Next.js Edge Middleware for Role-Based Access Control
├── project_rules.md                # Internal engineering and style guidelines
├── tsconfig.json                   # TypeScript compiler configuration (DOM, ESNext, strict flags)
├── /public/                        # Static assets served at the root domain
│   └── counter.json                # Temporary mock storage for visitor counter operations
├── /scripts/                       # Utility and CI/CD operations
│   └── seed-auth-account.cjs       # Helper script to populate base admin credential mappings
├── /lib/                           # Shared utility functions and services
│   ├── admin-analytics.ts          # Logic for computing admin graphs and retention metrics
│   ├── admin-api-guard.ts          # Server-side authorization wrappers for admin
│   ├── admin-events.ts             # Event CRUD operation wrappers
│   ├── admin-members.ts            # Member approval logic and queries
│   ├── postgres.ts                 # Database connection pooling singleton
│   ├── password.ts                 # Hashing algorithms (Argon2 / bcrypt implementations)
│   └── user-profile.ts             # Profile extraction and formatting utilities
├── /app/                           # Next.js App Router Root
│   ├── globals.css                 # Global tailwind injection and primary CSS variables
│   ├── layout.tsx                  # Root HTML/Body injection and context provider wrappings
│   ├── page.tsx                    # Landing page / Home
│   ├── /components/                # Application-wide reusable React components
│   │   ├── Navbar.tsx              # Top-level responsive navigation logic
│   │   ├── Footer.tsx              # Universal footer content
│   │   └── UniqueViewerCounter.tsx # Component logic bound to /api/counter
│   ├── /api/                       # Route handlers (Serverless functions)
│   │   ├── /admin/                 # Secured namespace for admin-only REST endpoints
│   │   ├── /auth/                  # Secure authentication endpoints (Login, Logout, Reset)
│   │   └── /counter/               # Public API fetching site analytics
│   ├── /admin/                     # Admin Workspace Domain
│   │   ├── layout.tsx              # Admin layout wrapper (Sidebars, context isolation)
│   │   ├── page.tsx                # Admin default dashboard overview
│   │   ├── /analytics/             # Admin reporting view (Charts and tables)
│   │   ├── /events/                # Admin event administration
│   │   ├── /members/               # Identity verification queue
│   │   ├── /scholarships/          # Finance module (Donor allocations, funds)
│   │   └── /settings/              # Application-wide administrative configurations
│   ├── /user/                      # User Workspace Domain
│   │   ├── layout.tsx              # Authenticated user scope layout
│   │   ├── /profile/               # User profile edit & resume upload
│   │   ├── /jobs/                  # Browsing and applying to alumni-posted roles
│   │   ├── /mentorship/            # Finding and requesting alumni mentors
│   │   └── /messages/              # Peer-to-peer internal communication tool
│   ├── /login/                     # Global Authentication View
│   ├── /register/                  # Registration intake funnel
│   ├── /about/                     # Public static page: Vision & History
│   ├── /directory/                 # Public-facing alumni search network
│   ├── /jobs/                      # Public preview of roles (requires auth to apply)
│   └── /donate/                    # Public fundraising operations domain
```

---


## 5. Primary System Workflows

The complexity of the system is distilled into operational workflows representing core logic gates.

### 5.1 Registration & Onboarding

```mermaid
sequenceDiagram
    participant Guest
    participant ValidationClient as Frontend Validation
    participant Edge as Edge Middleware
    participant Database
    participant Admin

    Guest->>ValidationClient: Fills /register Form (Email, Batch, Proof)
    ValidationClient->>Edge: POST /api/registrations
    Edge->>Edge: Validate Payload (Zod Schema)
    Edge->>Database: INSERT into registrations status='PENDING'
    Database-->>Guest: 201 Created (Success Message)
    
    Note over Admin,Database: Admin Queue Management
    Admin->>Database: Fetch PENDING registrations
    Admin->>Database: Update status='APPROVED'
    Database->>Database: Trigger Action -> CREATE user in users table
    Database-->>Admin: Success
    Admin->>Guest: Transactional Email Issued - Account Ready
```

### 5.2 Authentication & Authorization

Authentication guarantees session persistence and maps role matrices.

```mermaid
flowchart TD
    UserReq[User Submits Email/Password] --> VerifyCreds{Check Database}
    VerifyCreds -- Invalid --> Throw401[Throw 401 Unauthorized]
    VerifyCreds -- Valid --> CheckFirstLog{Is First Login?}
    
    CheckFirstLog -- Yes --> ForceReset[Require Password Change]
    ForceReset --> HashPass[Hash New Password]
    HashPass --> GenJWT[Generate Multi-Scope JWT]
    
    CheckFirstLog -- No --> GenJWT
    GenJWT --> WriteCookie[Set Secure, HttpOnly Cookie]
    WriteCookie --> RetrieveRole[Extract 'role' explicitly]
    
    RetrieveRole -->|'admin'| RedirectAdmin[Redirect to /admin/overview]
    RetrieveRole -->|'user'| RedirectUser[Redirect to /user/profile]
```

### 5.3 Mentorship & Networking

The mentorship pipeline allows safe coordination between alumni requesting guidance and established alumni offering it.

```mermaid
flowchart LR
    Mentee[User (Mentee)] -->|Queries| Directory[Alumni Directory]
    Directory -->|Filters| Mentor[User (Mentor)]
    Mentee -->|Sends| MentorshipReq[POST /api/mentorship/request]
    MentorshipReq --> NotificationQueue[SQS/Queue Service]
    NotificationQueue --> InternalMSG[Internal Message Pipeline]
    InternalMSG --> Mentor
    
    Mentor -->|Accepts| UpdateReq[PATCH /api/mentorship/request]
    UpdateReq --> EstablishLink[Create Mutual Connection]
```

### 5.4 Scholarship & Financial Disbursal

Handles end-to-end administration of donor obligations to beneficiary distributions.

```mermaid
flowchart TD
    subgraph Planning Phase
    Admin[Admin] -->|Creates| SchProgram[Scholarship Model]
    Admin -->|Maps| DonorCommit[Donor Commitment Ledger]
    end

    subgraph Application Phase
    User[Student / Alumni] -->|Submits| App[Scholarship Application]
    App --> ReviewQueue[Admin Review Pipeline]
    end

    subgraph Disbursal Phase
    ReviewQueue -->|Approves| SelectBeneficiary[Select User]
    SelectBeneficiary --> GenerateBatch[Create Disbursement Batch]
    GenerateBatch --> ExecTx[Disburse via API / Record TX]
    ExecTx --> LedgerUpdated[Financial Ledger Sealed]
    end
```

### 5.5 Job Board & Career Services

```mermaid
sequenceDiagram
    participant CorpAlumni as Corporate Alumni
    participant Portal
    participant SeekingAlumni as Job Seeker

    CorpAlumni->>Portal: POST /api/jobs (New Job Requisition)
    Portal->>Portal: Admin Auto-Approval / Verification
    SeekingAlumni->>Portal: GET /api/jobs (Filter by Category)
    SeekingAlumni->>Portal: POST /api/jobs/apply (Includes profile resume)
    Portal->>CorpAlumni: Notification - New Candidate Applied
```

### 5.6 Admin Support Queue

```mermaid
flowchart TD
    User-->|Creates| Ticket[Support Ticket / Query]
    Ticket-->AdminDash[Admin Request Board]
    AdminDash-->Prioritize[Rank Priority H/M/L]
    Prioritize-->Assign[Assign Admin Owner]
    Assign-->Thread[Add Internal Comments]
    Thread-->Resolution{Is Resolved?}
    Resolution-- Yes -->Close[Close & Notify User]
    Resolution-- No -->Escalate[Escalate to SuperAdmin]
```

---


## 6. Comprehensive Database Architecture

### 6.1 Global ER Diagram

The system relies heavily on third normal form (3NF) relational structures.

```mermaid
erDiagram
  USERS ||--o{ ALUMNI_PROFILES : possess
  USERS ||--o{ REGISTRATIONS : initiate
  USERS ||--o{ SESSIONS : maintain
  USERS ||--o{ SUPPORT_REQUESTS : create
  USERS ||--o{ REQUEST_COMMENTS : author
  USERS ||--o{ MENTORSHIP_REQUESTS : seek
  USERS ||--o{ MENTORSHIP_REQUESTS : mentor
  USERS ||--o{ EVENT_REGISTRATIONS : attend
  USERS ||--o{ DISBURSEMENTS : beneficiary_of
  USERS ||--o{ JOB_POSTINGS : post
  USERS ||--o{ JOB_APPLICATIONS : submit

  SCHOLARSHIPS ||--o{ DISBURSEMENTS : allocate
  DONORS ||--o{ DONOR_COMMITMENTS : fund
  SCHOLARSHIPS ||--o{ DONOR_COMMITMENTS : bundled_by

  EVENTS ||--o{ EVENT_REGISTRATIONS : map
  JOB_POSTINGS ||--o{ JOB_APPLICATIONS : receive

  USERS {
    uuid id PK
    string email UK
    string password_hash
    enum role "admin,user"
    boolean pending_first_login
    datetime created_at
    datetime updated_at
    datetime last_login
  }

  ALUMNI_PROFILES {
    uuid id PK
    uuid user_id FK
    string first_name
    string last_name
    string batch_year
    string major_discipline
    string current_company
    string current_role
    string linkedIn_url
    text bio
  }

  REGISTRATIONS {
    uuid id PK
    string email
    string first_name
    string last_name
    string verification_doc_url
    enum status "PENDING,APPROVED,REJECTED"
    datetime submitted_at
  }

  SUPPORT_REQUESTS {
    uuid id PK
    uuid created_by FK
    enum category "TECHNICAL,FINANCIAL,GENERAL"
    enum priority "LOW,MEDIUM,HIGH,CRITICAL"
    enum status "OPEN,ASSIGNED,RESOLVED,CLOSED"
    uuid assigned_admin_id FK
    text description
    datetime created_at
  }

  SCHOLARSHIPS {
    uuid id PK
    string program_name
    decimal total_fund_size
    string reporting_cycle "2025-2026"
    enum status "ACTIVE,EXHAUSTED,DRAFT"
  }

  DONOR_COMMITMENTS {
    uuid id PK
    uuid donor_id FK
    uuid scholarship_id FK
    decimal amount_committed
    date pledge_date
  }

  EVENTS {
    uuid id PK
    string title
    text description
    datetime start_time
    datetime end_time
    string location_url
    integer capacity
  }

  JOB_POSTINGS {
    uuid id PK
    uuid posted_by FK
    string job_title
    string company_name
    string location_type "REMOTE,HYBRID,ONSITE"
    enum status "ACTIVE,CLOSED"
    text requirements
  }
```

### 6.2 Detailed Table Schemas & Constraints

#### Table: `users`
**Purpose:** Global identity management context. All authorizations execute against definitions modeled here.
- `id` (UUID, Primary Key, Auto-generated default `gen_random_uuid()`)
- `email` (VARCHAR(255), Unique, Not Null, Indexed for fast login lookups)
- `password_hash` (VARCHAR(255), Not Null, Stores Argon2 hashes)
- `role` (ENUM('admin', 'user'), Default 'user')
- `pending_first_login` (BOOLEAN, Default True)
- `created_at` (TIMESTAMP WITH TIME ZONE, Default `NOW()`)

#### Table: `alumni_profiles`
**Purpose:** PII (Personally Identifiable Information) container for public and private directory display.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id` with `ON DELETE CASCADE`)
- `first_name` (VARCHAR(100), Not Null)
- `last_name` (VARCHAR(100), Not Null)
- `batch_year` (INTEGER, Constraint: `> 1900 AND <= CURRENT_YEAR()`)
- `current_company` (VARCHAR(150), Nullable - Allows B-Tree Index for job filtering)
- `bio` (TEXT, Nullable, Char limits applied at application edge)

#### Table: `scholarships`
**Purpose:** Administration root for grant definitions.
- `id` (UUID, Primary Key)
- `program_name` (VARCHAR(150), Not Null)
- `total_fund_size` (NUMERIC(12, 2), Constraint `> 0`)
- `status` (ENUM('ACTIVE', 'DRAFT', 'EXHAUSTED'), Default 'DRAFT')

---


## 7. API Reference & Contracts

All backend requests will operate over `application/json`. The Next.js Route handlers validate payloads rigorously via `zod`.

### 7.1 Authentication APIs

#### `POST /api/auth/login`
- **Description:** Consumes plaintext credentials, issues a session cookie.
- **Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response Payload (200 OK):**
  ```json
  {
    "status": "success",
    "user": {
      "id": "uuid-1234",
      "role": "admin",
      "requiresSetup": false
    }
  }
  ```

#### `POST /api/auth/setup-password`
- **Description:** Fulfills the `pending_first_login` gate.
- **Request Payload:**
  ```json
  {
    "new_password": "NewSecurePassword123!"
  }
  ```

### 7.2 General Module APIs

#### `GET /api/directory`
- **Description:** Retrieves paginated alumni data for the public directory.
- **Query Params:** `?page=1&limit=20&batch=2021&company=Google`
- **Response Payload (200 OK):**
  ```json
  {
    "data": [
      {
         "id": "profile-uuid",
         "name": "Jane Doe",
         "batch": 2021,
         "profession": "Software Engineer"
      }
    ],
    "meta": { "totalItems": 1500, "totalPages": 75 }
  }
  ```

#### `POST /api/admin/requests/:id/escalate`
- **Description:** Moves a support request to a higher priority bucket.
- **Request Payload:**
  ```json
  {
    "reason": "SLA breach threshold nearing",
    "new_priority": "CRITICAL"
  }
  ```
- **Response Payload (200 OK):**
  ```json
  {
    "status": "escalated",
    "request_id": "req-uuid",
    "timeline_event_created": true
  }
  ```

---


## 8. Security & Compliance

The Alumni Portal embeds security by default through rigorous infrastructure protocols.

### 8.1 Data Sanitization & Edge Security
- **Strict Validations:** Utilizing `zod` schemas on every API entry point to guarantee payload integrity before processing.
- **Parametrized Queries:** Utilizing ORMs guarantees immunity against basic SQL Injection vectors.
- **XSS & CSRF Prevention:** Handled natively by React's DOM rendering methodology and CSRF tokens verified during Next.js server actions.
- **Content Security Policy (CSP):** Delivered via `next.config.ts` headers restricting execute domains and framing interactions.

### 8.2 Authentication Protocol
- **Sessions:** JSON Web Tokens (JWT) mapped to strictly `HttpOnly`, `Secure`, and `SameSite=Lax` browser cookies. No JWTs are stored in `localStorage` in production.
- **Role Enforcement:** Executed systematically prior to hydration. If an actor attempts unauthorized access (e.g., User attempting to load `/admin`), middleware issues a `307 Temporary Redirect` instantly.

## 9. Deployment & Infrastructure

The project is natively designed for serverless architectures (e.g., Vercel or AWS Amplify), relying on decoupled database infrastructures.

### 9.1 CI/CD Pipeline Flow

```mermaid
flowchart LR
    Push[Push to Feature Branch] --> Lint[Run ESLint/Prettier]
    Lint --> BuildTest[Attempt Next.js Build]
    BuildTest --> Integration[Execute Integration Specs]
    Integration --> Merge[Merge to Main]
    Merge --> VercelEnv[Deploy to Runtime Environment]
    VercelEnv --> RunMigrations[Apply DB Migrations]
```

### 9.2 Vercel Deployment Strategy
1. **Repository Linkage:** Link GitHub repository to Vercel workspace.
2. **Environment Synchronization:** Apply all parameters noted in Section 10 to standard environments (Preview, Production).
3. **Build Command:** Vercel automatically detects `Next.js`. Default build commands apply:
   - Build: `next build`
   - Install: `npm install`
4. **Overrides:** Ensure middleware sizes remain within Edge limitations (1MB max).

---

## 10. Environment Variables

Create a local `.env.local` file avoiding injection of these defaults into version control.

| Variable Name | Required | Purpose | Example |
|---|---|---|---|
| `DATABASE_URL` | YES | Primary PostgreSQL Connection String | `postgresql://user:pass@host/db?schema=public` |
| `NEXTAUTH_SECRET` | YES | Cryptographic entropy for JWT hashing | `a_highly_secure_crypto_hash_string` |
| `NEXT_PUBLIC_APP_URL` | YES | Resolution anchor for generic links | `https://alumni.yourdomain.edu` |
| `REDIS_URL` | OPTIONAL | Connection to Upstash or Redis cache | `redis://default:pass@redis-host:6379` |
| `SMTP_HOST` | OPTIONAL | Nodemailer output gateway | `smtp.sendgrid.net` |
| `AWS_S3_BUCKET` | OPTIONAL | Object storage target context | `alumni-portal-media-assets` |

---

## 11. Testing & Quality Assurance

Adhering to high engineering standards necessitates rigorous testing disciplines.

### Methodology
- **Unit Testing:** Executed via `Vitest` or `Jest`. Validating utility constraints in `/lib` (e.g., testing `admin-analytics.ts` array reducer logic against mock records).
- **Integration Testing:** Validation of Server Actions interacting with Database context. Ensures cascading fails correctly throw application errors.
- **E2E Testing:** Executed via `Playwright`. Automated flows validating successful user logins navigating toward the creation of Mentorship requests.

**Test Commands:**
```bash
npm run test           # Executes Unit tests
npm run test:e2e       # Bootstraps Playwright contexts
npm run type-check     # Explicitly triggers isolated TS evaluation
```

---

## 12. Contribution Guidelines

Code structure is explicitly modeled after internal dictations specified in `project_rules.md`.

1. **Commit Convention:** Utilize semantic commit terminology (`feat:`, `fix:`, `chore:`, `refactor:`).
2. **Styling Philosophy:** Do not inject raw hexagonal values; employ exclusively Tailwind context metrics (`bg-primary-900`, `text-secondary-100`).
3. **Icons & Assets:** Limit graphical injections to the existing array of `lucide-react` constructs to sustain aesthetic homogeneity.
4. **State Delegation:** Avoid instantiating Global state (Redux) where Server state (SWR/React Query via Server Components) suffices. 

---

## 13. Glossary & Terminology

- **Edge Middleware:** Security checks executed topologically closest to the user's geographic location.
- **Disbursement:** The financial act of transferring cleared scholarship liquidity to evaluated candidates.
- **App Router:** The routing philosophy executed via `/app` defining React Server Components inherently by default.
- **First-Login Setup:** Pertains to accounts automatically created by admin systems requiring manual cryptographic password bindings by users during original access protocol.

---
**Maintained by the Alumni Tech Team | System Version 1.5.0**
