# HireTrail — Design Document

**Internship & Job Application Command Center**

CS5610 Web Development — Northeastern University, Khoury College of Computer Sciences

**Team:** Manav Kaneria · Tisha Anil Patel

**Date:** March 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Personas](#user-personas)
3. [User Stories](#user-stories)
4. [Architecture & Tech Stack](#architecture--tech-stack)
5. [API Endpoints](#api-endpoints)
6. [Design Mockups](#design-mockups)
7. [Division of Work](#division-of-work)
8. [Deployment & Infrastructure](#deployment--infrastructure)

---

## Project Overview

HireTrail is a browser-based job search management platform built for students and early-career professionals navigating the internship and full-time recruiting process. The platform treats the job search as a complete operational workflow rather than a simple status tracker.

Most students manage their job search with a combination of spreadsheets, sticky notes, email threads, and memory. This approach collapses as application volume grows past a few dozen companies. Key information gets lost: which resume went to which company, when the last follow-up was sent, whether a contact is a recruiter or a referral, and which stage of the funnel is actually leaking opportunities.

HireTrail solves this by providing five interconnected modules within a single command center: application tracking with stage history, resume versioning with performance analytics, contact relationship management, deadline tracking with urgency alerts, and a data-driven analytics dashboard. Every module is designed to work together, so a user can see their full picture in one place.

### Goals

- Replace fragmented spreadsheets and notes with a unified tracking system
- Give candidates visibility into their funnel conversion rates so they can identify weak points
- Track which resume version is performing best across applications
- Ensure no deadline or follow-up is missed during high-volume recruiting seasons
- Provide a clean, intuitive interface that doesn't add friction to an already stressful process

### Target Audience

The primary users are graduate and undergraduate students applying to internships and co-ops, bootcamp graduates entering their first job search, and early-career professionals navigating recruiting for the first time. These users share a common pattern: high application volume, multiple resume variants, numerous contacts across companies, and overlapping deadlines.

---

## User Personas

### Arjun Mehta

| | |
|---|---|
| **Background** | MS Computer Science student at Northeastern University, 2nd year |
| **Goal** | Land a summer co-op at a top-tier tech company |
| **Application Volume** | 80+ companies across SWE, data engineering, and ML roles |
| **Resume Strategy** | Three tailored versions: SWE-focused, data engineering, and ML-focused |
| **Pain Points** | Loses track of which resume went where, forgets to follow up after OAs, has no idea if his SWE resume outperforms his ML resume |
| **Needs** | Centralized application tracker, resume-to-application linking, performance comparison across resume versions |

Arjun represents the high-volume technical applicant. He's methodical but overwhelmed by the sheer number of applications. His primary frustration is the inability to correlate outcomes with specific resume versions. He needs data to make decisions, not just a list of companies.

### Sofia Reyes

| | |
|---|---|
| **Background** | Undergraduate Business student, final year, recruiting for finance and consulting |
| **Goal** | Secure a full-time offer in either investment banking or management consulting |
| **Contact Network** | Multiple contacts per firm: recruiters from cold emails, professor referrals, career fair alumni |
| **Pain Points** | Outgrew her spreadsheet, columns break when she adds new data, no way to link contacts to companies, misses follow-ups |
| **Needs** | Structured contact tracking per company, deadline management with urgency sorting, reliable follow-up reminders |

Sofia is the networking-heavy applicant. Her job search success depends on relationship management as much as application volume. She needs to know who she talked to at each firm, when the last touchpoint was, and what deadline is coming next. A missed follow-up can cost her an opportunity.

### Marcus Johnson

| | |
|---|---|
| **Background** | Bootcamp graduate, career switcher from marketing to software development |
| **Goal** | Land his first junior developer role within 3 months of graduating |
| **Application Volume** | 100+ companies, mostly cold applications with no referrals |
| **Pain Points** | No network to leverage, unclear whether low response rate is due to resume quality or targeting, can't identify where in the funnel he's losing |
| **Needs** | Funnel analytics showing conversion at each stage, resume performance data, weekly trend tracking to measure if efforts are improving |

Marcus is the data-hungry career switcher. Without a network, his strategy is volume-based, which means he needs analytics to understand whether his approach is working. He needs to see conversion rates at each stage so he can focus energy on what matters: if only 2% of applications lead to OAs, the resume needs work; if OA-to-interview conversion is 80%, the resume is fine and the bottleneck is elsewhere.

---

## User Stories

### Applications Module (Manav Kaneria)

#### US-01: Application CRUD

As a student, I want to create, view, update, and delete job applications so that I can maintain a complete record of every company I have applied to.

**Acceptance Criteria:** Each application stores company name, role title, job URL, application date, current stage (Applied, OA, Interview, Offer, Rejected), notes, and a tagged resume version. Stage updates are tracked with timestamps so I can see how long I have been at each stage. Applications are filterable by stage and searchable by company or role name.

#### US-02: Resume Versioning

As a student, I want to upload and manage multiple resume versions so that I can tag each application with the specific resume I submitted and later analyze which version performs best.

**Acceptance Criteria:** Resume versions are stored with a name, upload date, and target role type. Each application can be linked to one resume version. The resume list shows how many applications used each version, pulled from a live aggregation.

### Contacts Module (Tisha Anil Patel)

#### US-03: Contact Management

As a student, I want to log contacts at each company, including recruiters, hiring managers, and referrals, so that I can track every relationship in my job search and never lose a follow-up thread.

**Acceptance Criteria:** Contacts are linked to a company with name, role, LinkedIn URL, how we connected (cold email, referral, career fair, LinkedIn, professor intro, alumni network), and last contact date. There is a notes field per contact for conversation history.

### Deadlines Module (Tisha Anil Patel)

#### US-04: Deadline Tracking

As a student, I want to set and track deadlines like OA due dates, follow-up reminders, and offer decision dates so that I never miss a critical deadline during recruiting season.

**Acceptance Criteria:** Deadlines are linked to an application with a type, due date, and completion status. The dashboard surfaces upcoming deadlines sorted by urgency. Deadlines are color-coded: overdue (red), urgent/within 2 days (amber), this week (blue), and later (gray). Completion can be toggled with one click.

### Analytics Module (Tisha Anil Patel)

#### US-05: Analytics Dashboard

As a student, I want to see an analytics dashboard showing my application funnel, stage conversion rates, and resume performance so that I can make data-driven decisions about my job search strategy.

**Acceptance Criteria:** The dashboard includes a funnel bar chart showing total applications through to offers, conversion rate at each stage transition as a percentage with progress bars, resume performance breakdown showing response rate per version, and an applications-over-time line chart grouped by weekly cadence.

---

## Architecture & Tech Stack

### System Architecture

HireTrail follows a standard client-server architecture. The React frontend handles all rendering on the client side and communicates with the Express backend exclusively through RESTful API calls using the native fetch API. The backend connects to MongoDB Atlas using the native driver. In development, Vite proxies API requests to avoid CORS. In production, Express serves the React build as static files alongside the API endpoints, deployed as a single service on Render.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 with hooks, client-side rendering only |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| Type Checking | PropTypes on every component |
| Backend | Node.js + Express (ES Modules) |
| Database | MongoDB Atlas with the native driver (no Mongoose) |
| Authentication | Passport.js (Local + Google OAuth 2.0) |
| Sessions | express-session + connect-mongo |
| Password Security | bcrypt with 10 salt rounds |
| Linting | ESLint (frontend + backend configs) |
| Formatting | Prettier |
| Deployment | Render (single web service) |

Prohibited libraries not used: Axios, Mongoose, CORS, or any other explicitly banned dependency. All HTTP requests use the native fetch API. The Vite dev proxy eliminates CORS entirely so no CORS middleware is needed.

### Database Schema

| Collection | Owner | Key Fields |
|---|---|---|
| users | Shared | name, email, password (hashed), googleId, createdAt |
| applications | Manav | userId, company, role, jobUrl, applicationDate, stage, stageHistory[], resumeId, notes |
| resumes | Manav | userId, name, targetRole, fileName, uploadDate |
| contacts | Tisha | userId, name, company, role, linkedinUrl, connectionSource, lastContactDate, notes |
| deadlines | Tisha | userId, applicationId, type, dueDate, completed, notes |

The database is seeded with 1,000+ synthetic records across all collections using `seed.js`.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account with email + password |
| POST | /api/auth/login | Login with email + password |
| POST | /api/auth/logout | Destroy session and clear cookie |
| GET | /api/auth/me | Get current authenticated user |
| GET | /api/auth/google | Initiate Google OAuth flow |
| GET | /api/auth/google/callback | Google OAuth callback handler |

### Applications (Manav)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/applications | List all applications for current user |
| GET | /api/applications/:id | Get single application by ID |
| POST | /api/applications | Create new application with stage history |
| PUT | /api/applications/:id | Update application, track stage changes |
| DELETE | /api/applications/:id | Delete application |

### Resumes (Manav)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/resumes | List all resumes with usage counts |
| GET | /api/resumes/:id | Get single resume by ID |
| POST | /api/resumes | Create new resume version |
| PUT | /api/resumes/:id | Update resume metadata |
| DELETE | /api/resumes/:id | Delete resume version |

### Contacts (Tisha)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/contacts | List all contacts for current user |
| POST | /api/contacts | Create new contact |
| PUT | /api/contacts/:id | Update contact details |
| DELETE | /api/contacts/:id | Delete contact |

### Deadlines (Tisha)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/deadlines | List all deadlines sorted by due date |
| POST | /api/deadlines | Create new deadline linked to application |
| PUT | /api/deadlines/:id | Update deadline or toggle completion |
| DELETE | /api/deadlines/:id | Delete deadline |

### Analytics (Tisha)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/analytics | Aggregated funnel, conversions, resume stats, weekly trend |

---

## Design Mockups

The application uses a collapsible sidebar navigation on the left with the main content area occupying the remaining space. The color palette is Slate Blue with a dark sidebar (#1B2432), blue accent (#378ADD), and light content backgrounds (#F7F8FA).

### Login Page

```
┌─────────────────────────────────────────────┐
│                                             │
│              [ H ] HireTrail                │
│                                             │
│           Welcome back                      │
│     Sign in to manage your job search       │
│                                             │
│     ┌─────────────────────────────────┐     │
│     │    Continue with Google    [G]  │     │
│     └─────────────────────────────────┘     │
│                                             │
│               ─── or ───                    │
│                                             │
│     ┌─────────────────────────────────┐     │
│     │  Email                          │     │
│     └─────────────────────────────────┘     │
│     ┌─────────────────────────────────┐     │
│     │  Password                       │     │
│     └─────────────────────────────────┘     │
│                                             │
│     ┌─────────────────────────────────┐     │
│     │           Sign in               │     │
│     └─────────────────────────────────┘     │
│                                             │
│      Don't have an account? Create one      │
│                                             │
└─────────────────────────────────────────────┘
```

Centered card with HireTrail branding, Google OAuth as primary sign-in, and email/password as fallback. Register page mirrors this layout with an additional name field.

### Dashboard + Analytics

```
┌──────────┬──────────────────────────────────────────────┐
│          │  Dashboard                    [+ New App]    │
│  H       ├──────────┬──────────┬──────────┬────────────│
│          │ Total    │ In Prog  │ Offers   │ Rejected   │
│ Dashboard│ 650      │ 118      │ 32       │ 234        │
│ Apps     ├──────────┴──────────┴──────────┴────────────│
│ Resumes  │                                             │
│ Contacts │ ┌─ Recent Applications ─────┐ ┌─ Upcoming ─┐│
│ Deadlines│ │ Company  Role    Stage    │ │ OA - Today ││
│ Analytics│ │ Google   SWE     Interview│ │ Follow - 2d││
│          │ │ Meta     Backend OA       │ │ Prep - 5d  ││
│          │ │ Stripe   Full    Applied  │ │ Offer - 7d ││
│  ┌──┐    │ └───────────────────────────┘ └────────────┘│
│  │MK│    │                                             │
│  └──┘    │ ─────────── Analytics ──── Full analytics > │
│          │                                             │
│          │ ┌─ Funnel ──────────────┐ ┌─ Conversions ──┐│
│          │ │ Applied  ████████ 384 │ │ App>OA    22%  ││
│          │ │ OA       ███      86  │ │ OA>Int    37%  ││
│          │ │ Interview██       32  │ │ Int>Offer 44%  ││
│          │ │ Offer    █        14  │ │                ││
│          │ └───────────────────────┘ └────────────────┘│
└──────────┴─────────────────────────────────────────────┘
```

The sidebar is dark (#1B2432) with icon + label navigation. It collapses to icon-only on toggle. The dashboard shows stat cards at top, a two-column grid with recent applications and upcoming deadlines, then an analytics section below a divider with funnel chart and conversion rates.

### Applications Page

```
┌──────────────────────────────────────────────────────────┐
│  Applications                          [+ Add App]      │
│                                                          │
│  [ Search company or role... ]                           │
│  [All] [Applied 384] [OA 86] [Interview 32] [Offer 14]  │
│                                                          │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Company    Role           Stage      Resume   Date    ││
│ ├────────────────────────────────────────────────────────┤│
│ │ Google     SWE Intern     Interview  SWE v2   Mar 15  ││
│ │ Meta       Backend Intern OA         BE v1    Mar 12  ││
│ │ Stripe     Full Stack     Applied    SWE v2   Mar 10  ││
│ │ Airbnb     SWE Intern     Rejected   ML v1    Mar 8   ││
│ │ Nvidia     ML Intern      Offer      ML v1    Mar 5   ││
│ └────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

Stage filter chips show counts and highlight active filter. Each row has edit/delete action icons. Clicking edit or add opens the modal:

```
┌─────────────────────────────────────────┐
│  New Application                    [X] │
│                                         │
│  Company *         Role *               │
│  ┌──────────┐      ┌──────────┐         │
│  │ Google   │      │ SWE Int  │         │
│  └──────────┘      └──────────┘         │
│                                         │
│  Job URL                                │
│  ┌──────────────────────────────┐       │
│  │ https://careers.google.com   │       │
│  └──────────────────────────────┘       │
│                                         │
│  Stage              Resume Version      │
│  ┌──────────┐      ┌──────────┐         │
│  │ Applied ▾│      │ SWE v2  ▾│         │
│  └──────────┘      └──────────┘         │
│                                         │
│  Notes                                  │
│  ┌──────────────────────────────┐       │
│  │ Referred by alumni           │       │
│  └──────────────────────────────┘       │
│                                         │
│              [Cancel] [Add Application] │
└─────────────────────────────────────────┘
```

### Resumes Page

```
┌──────────────────────────────────────────────────────┐
│  Resumes                              [+ Add Resume] │
│                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │ [Doc]  E  D │ │ [Doc]  E  D │ │ [Doc]  E  D │    │
│  │             │ │             │ │             │    │
│  │ SWE v2     │ │ Data Eng    │ │ ML Resume   │    │
│  │ Software   │ │ Data Engg   │ │ Machine Lrn │    │
│  │ Eng        │ │             │ │             │    │
│  │ resume.pdf │ │ resume.pdf  │ │ resume.pdf  │    │
│  │            │ │             │ │             │    │
│  │ Mar 1      │ │ Feb 15      │ │ Feb 1       │    │
│  │ 142 apps   │ │ 87 apps     │ │ 63 apps     │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
└──────────────────────────────────────────────────────┘
```

Card grid showing each resume version with a document icon, version name, target role badge, file name, upload date, and live usage count pulled from an aggregation pipeline.

### Contacts Page

```
┌──────────────────────────────────────────────────────┐
│  Contacts                            [+ Add Contact] │
│                                                      │
│  [ Search name or company... ]                       │
│                                                      │
│  ┌────────────────────────┐ ┌────────────────────────┐│
│  │ [SC] Sarah Chen   E  D │ │ [JW] James Wilson E  D ││
│  │ Sr. Recruiter           │ │ Hiring Manager         ││
│  │ at Google               │ │ at Stripe              ││
│  │                         │ │                        ││
│  │ Career fair             │ │ Referral               ││
│  │ linkedin.com/in/sarah   │ │ linkedin.com/in/james  ││
│  │                         │ │                        ││
│  │ Great conversation,     │ │ Referred by NEU        ││
│  │ will follow up...       │ │ alumni network...      ││
│  │                         │ │                        ││
│  │ Last contact: Mar 14    │ │ Last contact: Mar 10   ││
│  └────────────────────────┘ └────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

Each card shows initials avatar, contact name, role and company, connection source badge, LinkedIn link, truncated notes, and last contact date.

### Deadlines Page

```
┌──────────────────────────────────────────────────────┐
│  Deadlines                          [+ Add Deadline] │
│                                                      │
│  [Upcoming 12] [Overdue 3] [Completed 45] [All]     │
│                                                      │
│ ┌────────────────────────────────────────────────────┐│
│ │ [ ] OA due date                     Today    E  D ││
│ │     Google - SWE Intern             (red)         ││
│ │     Check email for details                       ││
│ ├────────────────────────────────────────────────────┤│
│ │ [ ] Follow-up reminder              Tomorrow E  D ││
│ │     Meta - Backend Intern           (amber)       ││
│ ├────────────────────────────────────────────────────┤│
│ │ [ ] Interview prep                  3 days   E  D ││
│ │     Stripe - Full Stack             (blue)        ││
│ ├────────────────────────────────────────────────────┤│
│ │ [X] Thank you note                  Done     E  D ││
│ │     Nvidia - ML Intern              (green)       ││
│ └────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

Tab-based filtering with count badges. Each deadline row has a completion checkbox, type label, linked application, notes, color-coded urgency badge, due date, and action buttons.

### Analytics Page (Full)

```
┌──────────────────────────────────────────────────────┐
│  Analytics                                           │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Response │ │ Offer    │ │ Rejection│ │ Resume   ││
│  │ Rate     │ │ Rate     │ │ Rate     │ │ Versions ││
│  │ 38%      │ │ 5%       │ │ 36%      │ │ 8        ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                      │
│  ┌─ Funnel ──────────────┐ ┌─ Conversions ──────────┐│
│  │                       │ │                        ││
│  │ Applied  ████████ 384 │ │ Applied > OA     22%  ││
│  │ OA       ███       86 │ │ [=====             ]  ││
│  │ Interview██        32 │ │                        ││
│  │ Offer    █         14 │ │ OA > Interview   37%  ││
│  │                       │ │ [========          ]  ││
│  │  [Recharts BarChart]  │ │                        ││
│  │                       │ │ Interview > Offer 44% ││
│  └───────────────────────┘ │ [==========        ]  ││
│                            └────────────────────────┘│
│  ┌─ Weekly Trend ────────┐ ┌─ Resume Performance ───┐│
│  │                       │ │                        ││
│  │     /\    /\          │ │ Version  Apps Resp Rate││
│  │   /    \/    \   /    │ │ SWE v2   142   34  24%││
│  │  /            \/      │ │ DE        87   22  25%││
│  │                       │ │ ML        63    8  13%││
│  │  [Recharts LineChart] │ │ [progress bars]       ││
│  │                       │ │                        ││
│  └───────────────────────┘ └────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

Four stat cards at top, then a 2x2 grid: funnel bar chart (color-coded per stage), conversion rates with progress bars, weekly application trend line chart, and resume performance table with response rate bars.

---

## Division of Work

### Manav Kaneria — Full Stack

- **Frontend:** Application list page with stage filters and search, application detail modal with add/edit forms, resume management page with card grid, resume modal with versioning fields, dashboard overview with stat cards and recent activity
- **Backend:** REST endpoints for applications CRUD with stage history tracking, resume metadata CRUD with aggregation pipeline for usage counts
- **Database:** Applications collection, resumes collection, all CRUD operations using MongoDB native driver
- **Shared:** Authentication system (Passport Local + Google OAuth), sidebar and layout components, API utility layer, seed script, deployment configuration

### Tisha Anil Patel — Full Stack

- **Frontend:** Contacts page with card grid, search, and CRUD modal, deadline tracker page with tab filters, urgency badges, and completion toggles, analytics dashboard with Recharts bar chart, line chart, conversion bars, and resume performance table
- **Backend:** REST endpoints for contacts CRUD, deadlines CRUD with completion toggling, MongoDB aggregation pipelines for funnel analytics, conversion calculations, resume performance stats, and weekly trend data
- **Database:** Contacts collection, deadlines collection, aggregation queries for analytics

---

## Deployment & Infrastructure

The application is deployed as a single web service on Render. The build process installs dependencies for both the backend and frontend, builds the React application into static files, and starts the Express server which serves both the API and the client bundle.

### Build Pipeline

1. Install backend dependencies (`cd backend && npm install`)
2. Install frontend dependencies including dev tools (`cd frontend && npm install --include=dev`)
3. Build React app (`cd frontend && npm run build`) producing `frontend/dist/`
4. Start Express server (`cd backend && node server.js`) which serves the built React app as static files

### Environment Variables

| Variable | Purpose |
|---|---|
| MONGO_URI | MongoDB Atlas connection string |
| SESSION_SECRET | Secret for signing session cookies |
| NODE_ENV | Set to "production" on Render for secure cookies |
| CLIENT_URL | Frontend URL for OAuth redirects |
| GOOGLE_CLIENT_ID | Google OAuth client identifier |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret |
| GOOGLE_CALLBACK_URL | Full callback URL for Google OAuth |

No credentials are exposed in the codebase. All sensitive values are stored as environment variables and the `.env` file is gitignored. The `.env.example` file provides a template without actual values.

### Live Links

- **Deployed App:** [https://hire-trail.onrender.com](https://hire-trail.onrender.com)
- **GitHub Repository:** [https://github.com/gititmanav/Hire-Trail](https://github.com/gititmanav/Hire-Trail)