# Product Requirements Document (PRD): AI Worker Maker

## 1. Overview
"AI Worker Maker" is a web-based platform that lets non-technical users build and manage a virtual company staffed by customized AI agents. The core value is an intuitive, polished, frictionless GUI — zero coding knowledge required.

## 2. Target Audience & Strict UX Rules
- **Crucial Rule (No-CLI):** Users must NEVER be required to use a terminal. Every feature must be accessible via an intuitive web GUI.
- **Modern UI:** Use `shadcn/ui` and TailwindCSS with soft shadows, rounded corners, and friendly CTAs (e.g., "Hire AI Employee").
- **Mobile-First:** Fully responsive. Sidebars hidden behind a hamburger menu on mobile.

## 3. Access Model: BYOK (Bring Your Own Key) — MVP Scope

### Decision
**There is no subscription, billing system, or paid tier in the MVP.** No Stripe integration. No usage tracking tables. No credit system. This keeps the platform free to operate and the architecture simple.

### How It Works
- Users bring their own Anthropic API key (`sk-ant-...`).
- The key is stored **only in the browser's `localStorage`**. It is never written to Supabase or any server-side database.
- All Claude API calls pass the key directly from the client request to the Anthropic API. The server acts as a secure proxy but does not persist the key.
- The PM Chat (`/api/pm-chat`) and Agent Chat (`/api/chat`) routes both accept an `apiKey` field in the request body and forward it to the Anthropic SDK. If a server-side `ANTHROPIC_API_KEY` env var exists (for demos/testing), it is used as a fallback.

### Scope Exclusions (Do Not Build)
- ❌ No Stripe or any other payment gateway
- ❌ No subscription plans, plan tiers, or paywalls
- ❌ No `subscriptions`, `usage_events`, or `credits` database tables
- ❌ No "Cloud Plan" that uses a shared master API key for paying users
- ❌ No usage metering or rate limiting per user
- ❌ No Local AI / Ollama / Desktop Helper App — BYOK Anthropic API only

## 4. BYOK Onboarding: Idiot-Proof API Key Setup (Critical UX)

Because our users are non-coders, the API key setup experience must be extraordinarily friendly. A blank input field is not acceptable.

### API Key Modal Design Requirements
The Connection Modal must display a numbered, visual step-by-step guide before the input field:

| Step | Instruction | UI Element |
|------|-------------|------------|
| 1 | Go to console.anthropic.com | Primary button "Open Anthropic Console →" (opens new tab) |
| 2 | Create a free account or sign in | Plain text instruction |
| 3 | Add billing credits (minimum ~$5) | ⚠️ Warning note explaining Anthropic requires a credit balance even for pay-as-you-go. Include link to Anthropic billing page. |
| 4 | Click "API Keys" → "Create Key" | Plain text with GIF placeholder `[GIF: Creating a key]` |
| 5 | Copy the key starting with `sk-ant-...` and paste below | Input field with eye toggle |

**Security note (mandatory):** Displayed below the input — "Your key is saved only in this browser. It is never sent to our servers."

**Validation:** The save button is disabled until the input starts with `sk-ant-`.

## 5. Core Features

### Auth
Email/password Signup/Login via Supabase Auth.

### Company Vision (/onboard)
Interactive split-pane Chief PM chat. Left pane: streaming conversation with the PM agent. Right pane: live Charter document that updates in real-time. On completion, the PM proposes a team structure which the user approves to auto-populate the dashboard.

### Company Dashboard (/dashboard)
- Visual overview of departments and agents with colored department cards.
- Status Indicators: 🟢 Working, ⚪ Idle, 🟠 Blocked — shown on every agent.
- Current Task Snippets: 1-line activity summary per agent.
- Vision Banner: Links to `/onboard`, shows draft/approved status of the company charter.
- Toast notifications when an agent completes a task.

### Task Workspace (/workspace)
Full-screen chat with a selected AI agent. Real-time streaming. Auto-scroll. Agent list in sidebar (desktop) or hamburger drawer (mobile).

#### Code Preview & Artifact System (No-CLI Rule)
Because our users are non-technical, agents must **never** give CLI/terminal instructions. Instead:

- **Live Preview Panel:** When an agent generates code (HTML, CSS, JS, JSX), a "Preview" button appears below the code block. Clicking it opens a right-side iframe sandbox (`sandbox="allow-scripts"`, `srcdoc`) that renders the code live in the browser. On mobile, the preview opens as a fullscreen overlay.
- **1-Click Export:** Every code block shows action buttons:
  - **Preview** — opens the live preview panel
  - **Download** — triggers a browser download of the code file
  - **Copy Code** — copies to clipboard
  - **Save to GitHub** — placeholder button for future OAuth-based GitHub integration (no terminal)
- **Agent Tone Directive:** All agent system prompts are appended with a server-side directive that forbids CLI instructions and instructs the agent to provide self-contained, previewable code with guidance like "Click Preview to see it live."
- **Supported Languages:** HTML, CSS, JavaScript, JSX/TSX (via Babel standalone + React UMD), SVG. Plain JS output is wrapped with a console.log capture display.

## 6. Tech Stack
- **Frontend:** Next.js (App Router), TailwindCSS, shadcn/ui.
- **Backend:** Next.js API Routes (secure proxy — never persists API keys).
- **Database & Auth:** Supabase (PostgreSQL + RLS). Tables: `company_visions`, `departments`, `agents`. No billing tables.
- **AI:** Anthropic Claude API (user-supplied BYOK key only).

## 7. Internationalization (i18n)
Full EN/KO support via React Context. Language auto-detected from `navigator.language`, persisted in `localStorage`. All UI strings defined in `en.ts` (Dict interface) and `ko.ts`.

## 8. Task Status & Visibility System
- `AgentStatus` React Context with `localStorage` persistence tracks `idle | working | blocked` per agent ID.
- Status transitions driven by WorkspaceChat streaming loop events.
- Future: Supabase Realtime sync via `agent_tasks` table for cross-tab/multi-user visibility.
