# Handly Lead-Engine

24/7 automated lead qualification engine for German roofers. Replaces manual call-based qualification with an always-on WhatsApp/SMS funnel that produces structured **Deal Cards** for a mobile-first roofer dashboard.

## Problem

- **Availability gap** — leads arriving after 6 PM go cold until the next morning
- **Unstructured data** — raw transcripts are unusable; roofers need key facts (roof type, m², budget, urgency) at a glance
- **Last-mile UX** — roofers on-site need zero-training, one-tap actions (Schedule Visit / Request More Info)

## MVP Architecture

```
WhatsApp/SMS webhook → LLM qualification agent → JSON Deal Card → Roofer Dashboard
```

1. **Inbound** — WhatsApp / SMS webhook trigger
2. **Intelligence** — LLM-based agent conducts empathetic qualification interview, outputs structured JSON
3. **Interface** — Web dashboard renders Deal Cards with action buttons

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind v4, shadcn/ui
- **Backend:** Express.js (Node), SQLite (better-sqlite3)
- **Messaging:** Twilio (WhatsApp + SMS)
- **AI:** Claude API (@anthropic-ai/sdk)
- **State:** TanStack Query (10s polling)
- **Routing:** React Router v7
- **Testing:** Vitest, Playwright

> See [SKILLS-AND-PLUGINS.md](SKILLS-AND-PLUGINS.md) for available dev tools and when to use them.

## Getting Started

```bash
npm install
cp .env.example .env  # add your API keys

# Run both frontend + backend
npm run dev            # Vite frontend at localhost:5173
npm run server         # Express backend at localhost:3001

npm run build          # production build
npm test               # run unit tests
```

## Project Structure

```
server/
  index.ts          # Express entry point
  db.ts             # SQLite schema + queries
  agent.ts          # Claude API qualification agent
  webhook.ts        # Twilio webhook handler
  routes.ts         # REST API routes
src/
  components/       # Custom components (DealCard, StatusBadge, NavLink)
    ui/             # shadcn/ui primitives
  pages/            # Route pages (Index, NotFound)
  types/            # TypeScript types (lead.ts)
  hooks/            # Custom hooks
  lib/              # Utilities
```

## Current State

Frontend dashboard with mock Deal Cards showing lead qualification data (name, roof type, area, budget, urgency, AI summary). No backend or messaging integration yet.
