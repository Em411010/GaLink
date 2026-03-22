# GaLink — Filipino Freelance & Skills Marketplace

> Connecting talented Filipino workers with people who need them — powered by AI matching, verified trust, and real-time collaboration.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Our Solution](#our-solution)
3. [Features](#features)
   - [Authentication & User Management](#1-authentication--user-management)
   - [Badge & Verification System](#2-badge--verification-system)
   - [AI-Powered Chatbot (GaLink AI)](#3-ai-powered-chatbot-galink-ai)
   - [Skill-Based Matching](#4-skill-based-matching)
   - [Social Feed](#5-social-feed)
   - [Reels](#6-reels)
   - [Real-Time Messaging](#7-real-time-messaging)
   - [Contract Management](#8-contract-management)
   - [Ratings & Reviews](#9-ratings--reviews)
   - [Notifications](#10-notifications)
   - [Admin Panel](#11-admin-panel)
   - [Freelancer Discovery](#12-freelancer-discovery)
   - [Resume Upload & AI Skill Extraction](#13-resume-upload--ai-skill-extraction)
   - [Portfolio Management](#14-portfolio-management)
   - [AI-Recommended Seminars](#15-ai-recommended-seminars)
   - [Geolocation](#16-geolocation)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Badge System](#badge-system)
7. [AI Services](#ai-services)
8. [Getting Started](#getting-started)
9. [API Overview](#api-overview)
10. [Seeding the Database](#seeding-the-database)

---

## Problem Statement

The Philippines faces persistent **unemployment and underemployment**, especially among skilled blue-collar and informal workers — electricians, plumbers, carpenters, cleaners, tutors, and more. Many capable workers lack a trusted digital presence, while people and businesses who need those skills have no reliable way to find, verify, or transact with them.

This gap is directly at odds with **UN SDG 8: Decent Work and Economic Growth**, which calls for full and productive employment, the promotion of entrepreneurship, and the formalization of informal labor markets.

**Specific problems we identified:**

- Skilled workers in the informal economy are invisible online — no profiles, no reputation, no discoverability.
- Hirers rely on word-of-mouth or unverified social media posts, making it hard to find trustworthy workers.
- No lightweight digital contract or payment trail exists to protect both parties.
- Language barriers (Filipino, Taglish, Cebuano) prevent many users from adopting English-only platforms.
- Freelance platforms like Upwork or Fiverr are geared toward digital workers — they do not serve carpenters, plumbers, gardeners, or home service providers.

---

## Our Solution

**GaLink** is a full-stack web and mobile platform that bridges the gap between skilled Filipino workers and the people who need them. Our solution includes:

| Problem | GaLink's Solution |
|---|---|
| Workers are invisible online | Profile creation with skills, location, rates, and portfolio |
| No trust or verification | 4-level badge system backed by ID, selfie, and clearance KYC |
| Hard to find the right worker | AI-powered chatbot interprets problems and recommends matches |
| Language barriers | Multilingual AI (English, Taglish, Cebuano) chatbot |
| No formal work agreement | Built-in digital contract system with lifecycle management |
| No track record | Ratings per completed contract (work quality, communication, reliability) |
| No community for workers | Social feed and reels for sharing skills and work |
| Skills mismatch | Resume parsed by AI to auto-extract skills and build profile |
| Informal workers miss growth | AI-recommended seminars and upskilling based on skill level |

---

## Features

### 1. Authentication & User Management

- **Register / Login / Logout** with secure JWT-based authentication (HTTP-only cookie).
- **Welcome email** sent to new users on registration.
- Profile fields: name, bio, location, skills, experience, hourly rate, rate type, service categories, available days, service areas.
- Profile photo upload via Cloudinary.
- Toggle availability (Open for Work).
- All sensitive routes protected via `protect` middleware.

---

### 2. Badge & Verification System

GaLink uses a **4-level trust badge** system to progressively verify users and unlock features:

| Level | Badge | How to Earn | Unlocks |
|---|---|---|---|
| 0 | Unverified 🔒 | Default | Browse only |
| 1 | Hirer 🟢 | Email OTP verification | Messaging, chatbot, commenting, contracts |
| 2 | Freelancer 🔵 | Upload resume + email verified | Create posts, create reels |
| 3 | Verified Freelancer ⭐ | KYC (Gov ID + Selfie) + Clearance approved by admin | Full access + trust badge |

**Verification steps:**
- **Email OTP** — 6-digit code sent to email, verified in-app.
- **Resume upload** — PDF or DOCX resume parsed by AI to extract skills and bio.
- **Government ID** — Upload PhilSys, Passport, Driver's License, SSS, or UMID. Reviewed by admin.
- **Selfie** — Liveness check photo uploaded and reviewed by admin.
- **NBI / Police Clearance** — Document uploaded and reviewed by admin.

Admin can approve, reject (with reason), or revoke verification at any time. Users receive in-app notifications for each decision.

---

### 3. AI-Powered Chatbot (GaLink AI)

The centerpiece of GaLink's matching experience. Instead of manually searching for keywords, users describe their problem in plain language and GaLink AI finds the right worker.

**How it works:**
1. User types a problem in English, Taglish, or Cebuano (auto-detected).
2. AI interprets the problem, extracts required skills, estimates urgency, and determines if a service is needed.
3. If the request is vague, the chatbot asks a clarifying follow-up (once only, to avoid annoyance).
4. AI presents a soft-confirmation ("It sounds like you need X — does that sound right?").
5. User confirms and receives a ranked list of matched freelancers.
6. Each freelancer card is clickable — users can message them directly from the chatbot panel.

**Language capabilities:**
- Detects Tagalog/Taglish and Cebuano from keyword pattern matching.
- Responds in the same language the user is using.
- Falls back to general AI chat for non-service conversations.

**Chat history** is persisted across sessions using Zustand + localStorage.

---

### 4. Skill-Based Matching

The matching engine scores freelancers against a request using a weighted algorithm:

| Factor | Weight |
|---|---|
| Skill match (with category-level synonyms) | 60% |
| Badge level bonus | 15% |
| Track record (ratings + completed jobs) | 15% |
| Budget fit | 10% |

- Skill matching uses **synonym expansion** — e.g., "plumbing" matches "pipe fitting", "leak repair", "faucet".
- Location-aware matching uses Haversine distance from user's GPS coordinates.
- Results are sorted by composite score (highest first).

Accessible via:
- `GET /api/matches` — direct skill-based search
- `POST /api/chatbot/interpret` — AI-interpreted problem → automatic matching

---

### 5. Social Feed

A LinkedIn-style social feed where verified workers and hirers share work updates, job posts, and achievements.

**Features:**
- Create posts with text, optional image upload, and tags.
- Like and unlike posts (with notification to author).
- Comment on posts (replies supported).
- Reply to individual comments.
- Delete own posts.
- Feed is paginated (10 posts per page).
- Sidebar shows trending tags, hiring posts, and verified worker stats.

**Access control:**
- Viewing feed: Badge Level 1+
- Creating posts / reels: Badge Level 2+ (Freelancer)
- Commenting: Badge Level 1+

---

### 6. Reels

A TikTok/Instagram Reels-style short video feed for workers to showcase their craft.

**Features:**
- Upload video (MP4/WebM/QuickTime via Cloudinary).
- AI auto-tags reels based on description (detects skills, generates hashtags).
- Like and unlike reels (with notification to author).
- Paginated feed sorted by newest.
- Reel cards show author profile, detected skills, likes, and view count.

---

### 7. Real-Time Messaging

Full-featured direct messaging system between users, powered by **Socket.IO**.

**Features:**
- Start or continue a conversation with any user from their profile or chatbot results.
- Send text messages with optional image attachments.
- **Reply to a specific message** (quote-style reply with preview).
- **Read receipts** — messages marked as read in real time.
- **Unread badge count** per conversation in the sidebar.
- **Delete a message** (soft-delete — shows "Message deleted" placeholder).
- **Clear All** — wipe all messages in a conversation (soft-delete, synced via socket to both parties).
- Contract messages appear inline in the chat with a special card UI.
- Real-time delivery via Socket.IO room per conversation ID.

**Socket events:**
| Event | Description |
|---|---|
| `message:receive` | New message delivered |
| `message:deleted` | Single message deleted |
| `messages:read` | Read receipt broadcast |
| `conversation:cleared` | All messages cleared |

---

### 8. Contract Management

A lightweight digital contract system to formalize work agreements between hirers and freelancers.

**Contract lifecycle:**

```
pending → active → completed
         ↓
       cancelled
         ↓
       disputed
```

**Features:**
- **Create a contract** — Title, description, skills/tags, amount (₱), rate type (fixed/hourly), start and end dates.
- Contract is automatically sent as a message in the shared conversation.
- **Accept / Decline** — Freelancer can accept or decline a pending contract.
- **Mark as Completed** — Hirer marks the contract completed; freelancer's `completedJobs` counter increments.
- **Cancel** — Hirer can cancel a pending or active contract.
- **Dispute** — Either party can raise a dispute on an active contract with a reason.
- **Modification Requests** — Freelancer can request changes to a contract; hirer can resolve or dismiss.
- **Print / Save as PDF** — Printable contract document with branding, party details, terms, skills, and performance rating.
- Notifications sent to both parties on every status change.

---

### 9. Ratings & Reviews

After a contract is completed, the hirer can rate the freelancer across three dimensions:

| Metric | Scale |
|---|---|
| Work Quality | 1–5 |
| Communication | 1–5 |
| Reliability | 1–5 |

- Composite average is calculated and stored on the freelancer's profile.
- Ratings are displayed on the freelancer's public profile with individual comments.
- Rating is linked to the contract for reference.
- A hirer can update a rating they previously submitted.

---

### 10. Notifications

Real-time in-app notification system for all major events.

**Notification types:**
- Post liked / commented on
- Reel liked
- Contract received / accepted / declined / completed / cancelled / disputed
- Verification approved / rejected (KYC, clearance, government ID, selfie)
- Verification revoked by admin
- Post or reel removed by admin

**Features:**
- Bell icon with unread count badge in the navbar.
- Mark individual notifications as read or mark all as read.
- Real-time delivery via Socket.IO.

---

### 11. Admin Panel

A protected dashboard accessible only to users with `isAdmin: true`.

**Dashboard stats:**
- Total users by badge level (0–3)
- Pending KYC reviews
- Pending clearance reviews
- Banned users count
- Total posts and reels
- New users in the last 7 days

**User management:**
- Browse all users with search and badge-level filter.
- View uploaded documents — government ID, selfie, clearance.
- **Approve or reject** government ID (with rejection reason).
- **Approve or reject** selfie (with rejection reason).
- **Approve or reject** clearance (with rejection reason).
- **Revoke** all verification from a user (with reason).
- **Ban / Unban** a user (deactivates their account).

**Content moderation:**
- Browse all posts with search.
- Delete any post (author is notified).
- Delete individual comments from a post.
- Browse all reels with search.
- Delete any reel (author is notified).

---

### 12. Freelancer Discovery

A searchable directory of active freelancer profiles.

**Features:**
- Search by name, skill keyword, or bio.
- Filter by skill and location.
- Pagination (12 per page, sorted by average rating).
- Each card shows: name, profile photo, badge, location, skills, rating, and rate.
- Click through to a full profile page.

**Profile page shows:**
- Bio, location, skills, service categories, years of experience, rate
- Badge level with upgrade prompt for own profile
- Portfolio gallery
- Ratings and reviews
- Available days and service areas
- Resume download link (if uploaded)
- "Message" button to start a conversation

---

### 13. Resume Upload & AI Skill Extraction

Freelancers can upload a **PDF or DOCX resume** which is:

1. Parsed server-side — text extracted using `pdfjs-dist` (PDF) or `mammoth` (DOCX).
2. Sent to the AI service to extract: **skills list**, **years of experience**, and a **professional summary**.
3. Extracted skills **replace** the user's current skill list on their profile.
4. The summary is auto-populated as the user's bio (can be edited later).
5. Resume is stored on Cloudinary and linked to the profile.
6. Marks the user as a **freelancer** (`isFreelancer: true`) automatically.

---

### 14. Portfolio Management

Freelancers can build a visual portfolio to showcase past work.

**Each portfolio item includes:**
- Title (required)
- Description
- Optional cover image (uploaded to Cloudinary)
- External link (e.g., GitHub, Behance, live project)
- Tags / skill keywords

**Operations:**
- Add, edit, and remove portfolio items.
- Portfolio is displayed on the public profile page.
- Badge system counts portfolio items as part of the Freelancer (Level 2) checklist.

---

### 15. AI-Recommended Seminars

Based on a user's current skills and badge level, GaLink AI recommends relevant **online seminars and courses** to help them upskill.

- Recommendations are personalized per user.
- Results are cached for 30 minutes (TTL) per user to reduce AI API calls.
- Cache is force-refreshable by the user.
- Displayed in the sidebar on the feed page.

---

### 16. Geolocation

GaLink uses browser GPS and reverse geocoding to provide location-aware features.

- **Auto-detect location** on login (Philippines bounding box validated — ignores non-PH coordinates).
- **Reverse geocoding** via Nominatim (OpenStreetMap) to convert GPS coordinates to a human-readable address.
- **Forward geocoding** on the backend when a user types a location manually.
- Location is stored as both a string (`"Makati, Metro Manila, Philippines"`) and GeoJSON Point for distance calculations.
- **Matching** uses Haversine distance — nearby workers rank higher.
- Users can **manually override** their location at any time.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| Socket.IO | Real-time messaging and notifications |
| JWT (HTTP-only cookie) | Authentication |
| Cloudinary | Image, video, and file storage |
| Nodemailer | Transactional email (welcome + OTP) |
| pdfjs-dist + mammoth | Resume text extraction |
| rate-limiter-flexible | Rate limiting (100 req/min general, 20 req/min for AI routes) |
| bcrypt | Password hashing |

### Frontend (Web)
| Technology | Purpose |
|---|---|
| React 18 + Vite | SPA framework and build tool |
| Tailwind CSS v4 + DaisyUI | Utility-first styling |
| Zustand | Global state management |
| Axios | HTTP client |
| Socket.IO Client | Real-time events |
| Lucide React | Icon library |
| React Router v6 | Client-side routing |

### AI Services (Python)
| Technology | Purpose |
|---|---|
| FastAPI | AI microservice REST API |
| OpenAI GPT | Problem interpretation, skill extraction, chatbot chat, seminar recommendations |
| Python 3.11+ | Runtime |

### Mobile (React Native — in progress)
| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile app |
| Expo | Build and development tooling |

---

## Project Structure

```
GaLink/
├── backend/              # Express + MongoDB REST API
│   └── src/
│       ├── app.js
│       ├── config/       # DB, Cloudinary, Socket.IO setup
│       ├── controllers/  # Route handlers
│       ├── middleware/   # Auth, badge guard, rate limiter, error handler
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API route definitions
│       └── services/     # AI, badge, email, match, notification logic
├── web/                  # React + Vite frontend
│   └── src/
│       ├── pages/        # Full-page views
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks (geolocation, etc.)
│       ├── services/     # Axios API clients
│       └── store/        # Zustand global state
├── ai-services/          # Python FastAPI microservice
│   ├── main.py
│   ├── matching/         # Skill match service
│   ├── skill_extraction/ # Resume AI extraction
│   └── video_analysis/   # Reel content tagging
├── mobile/               # React Native app (in progress)
├── shared/               # Shared constants and utilities
└── scripts/              # Seed script, setup scripts
```

---

## Badge System

The badge system is the backbone of trust on GaLink. It is enforced both on the **backend** (`requireBadge` middleware) and **frontend** (`AccessGate` component).

```
Level 0 — Unverified
  └─ Can: Browse profiles and feed (read-only)

Level 1 — Hirer 🟢
  └─ Requires: Email OTP verified
  └─ Can: Message users, use chatbot, comment on posts, manage contracts

Level 2 — Freelancer 🔵
  └─ Requires: Level 1 + resume uploaded + portfolio item added
  └─ Can: Create posts and reels, appear in freelancer search

Level 3 — Verified Freelancer ⭐
  └─ Requires: Level 2 + KYC (Gov ID + Selfie approved) + Clearance approved
  └─ Can: Full platform access, displayed prominently in search and sidebar
```

Badge is automatically recalculated on every profile-updating action (`refreshBadge` service).

---

## AI Services

The Python FastAPI microservice (`ai-services/`) exposes endpoints consumed by the Node.js backend:

| Endpoint | Description |
|---|---|
| `POST /matching/match` | Score and rank freelancers against a skill requirement |
| `POST /skill-extraction/extract` | Parse resume text → skills, experience, summary |
| `POST /video-analysis/analyze` | Analyze reel description → tags and detected skills |

The Node.js `ai.service.js` also calls OpenAI directly for:
- **`interpretProblem`** — Chatbot problem interpretation (multilingual)
- **`chatWithAI`** — Conversational fallback chat
- **`extractResumeData`** — Resume text → structured profile data
- **`analyzeReelContent`** — Reel description → tags and skills
- **`recommendSeminars`** — Skill-based seminar recommendations

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.11+ (for AI microservice)
- Cloudinary account
- OpenAI API key

### 1. Clone the repository

```bash
git clone <repo-url>
cd GaLink
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env    # Fill in: MONGODB_URI, JWT_SECRET, CLOUDINARY_*, OPENAI_API_KEY, EMAIL_*
npm install
npm run dev
```

### 3. Frontend setup

```bash
cd web
npm install
npm run dev
```

### 4. AI Services setup

```bash
cd ai-services
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. Environment Variables (backend)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLIENT_URL` | Frontend URL (e.g., `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `AI_SERVICE_URL` | Python AI service URL (default: `http://localhost:8000`) |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |

---

## API Overview

| Module | Base Path | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | POST `/register`, POST `/login`, POST `/logout`, GET `/me` |
| Users | `/api/users` | GET `/freelancers`, GET `/:id`, PUT `/profile`, POST `/resume`, PUT `/availability/toggle` |
| Feed | `/api/feed` | GET `/`, POST `/`, POST `/:id/like`, POST `/:id/comment`, DELETE `/:id` |
| Reels | `/api/reels` | GET `/`, POST `/`, POST `/:id/like` |
| Messages | `/api/messages` | GET `/conversations`, POST `/conversations`, GET `/conversations/:id`, POST `/conversations/:id`, DELETE `/conversations/:id/messages/:msgId`, DELETE `/conversations/:id/messages` |
| Chatbot | `/api/chatbot` | POST `/interpret`, POST `/chat` |
| Matches | `/api/matches` | GET `/` |
| Contracts | `/api/contracts` | GET `/me`, POST `/`, PUT `/:id/accept`, PUT `/:id/decline`, PUT `/:id/status` |
| Ratings | `/api/ratings` | POST `/:freelancerId`, GET `/:freelancerId` |
| Verification | `/api/verification` | GET `/status`, POST `/email/send-otp`, POST `/email/verify`, POST `/government-id`, POST `/selfie`, POST `/clearance`, POST `/portfolio` |
| Notifications | `/api/notifications` | GET `/`, PUT `/read-all`, PUT `/:id/read` |
| Admin | `/api/admin` | GET `/stats`, GET `/users`, POST `/users/:id/approve-kyc`, POST `/users/:id/ban`, DELETE `/posts/:id` |

---

## Seeding the Database

A comprehensive seed script is included to populate the database with **40 Filipino freelancer profiles**, posts, reels, and completed contracts for demo/testing.

```bash
cd scripts
node seed.js
```

The seed creates:
- 40 workers across skill categories: Tech, Carpentry, Education, Electrical, Plumbing, and more
- 40 posts (one per worker with work showcase content)
- 40 reels (one per worker)
- Completed contracts with ratings between pairs of workers
- All users set to Badge Level 3 (Verified Freelancer) with realistic GPS coordinates across Metro Manila and Region 4A

---

## License

This project is developed as an academic capstone project aligned with **UN Sustainable Development Goal 8: Decent Work and Economic Growth**.

Built with ❤️ for Filipino workers.
