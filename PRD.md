# Project: AI Agent Worker Maker

## 1. Overview
A web platform where users can structure a virtual company. Users can create departments, assign AI employees (agents) to those departments with specific roles, and request tasks.

## 2. Core Features
- **User Auth:** Signup/Login via Supabase.
- **Dashboard:** View company structure and existing departments (e.g., Marketing, HR, Development).
- **Department & Agent Management:** - Create new departments.
  - Hire (Create) AI employees by defining their Name, Department, and System Prompt (Role/Persona).
- **Task Workspace:** A chat-like interface to assign tasks to specific AI employees and receive their work outputs.

## 3. Tech Stack (Cost-Effective)
- Frontend: Next.js (App Router), TailwindCSS, shadcn/ui (for clean UI)
- Backend/AI Logic: Python (FastAPI) to handle Anthropic Claude API calls for the agents.
- Database & Auth: Supabase (Free tier)