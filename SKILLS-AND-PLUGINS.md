# Skills & Plugins Reference

Available tools to accelerate development of the Handly Lead-Engine. See [README.md](README.md) for project context.

---

## Built-in Skills (Available Now)

### `claude-api`
**Trigger:** Code imports `@anthropic-ai/sdk` or user asks to use Claude API.
**Use for:** Building the LLM qualification agent. Handles multi-turn conversation, structured JSON output via tool use, and German-language empathetic responses.
**Where in project:** `server/agent.ts` — the core qualification intelligence.

### `react-best-practices`
**Trigger:** Writing or refactoring React/Next.js components.
**Use for:** Optimizing the Deal Card dashboard. Performance patterns, data fetching, bundle optimization.
**Where in project:** `src/components/`, `src/pages/` — the roofer-facing UI.

### `supabase-postgres`
**Trigger:** Writing or optimizing Postgres/SQL queries.
**Use for:** Schema design guidance (transferable to SQLite). Query optimization, indexing.
**Where in project:** `server/db.ts` — lead and conversation storage.

### `playwright`
**Trigger:** User needs browser automation or end-to-end testing.
**Use for:** Testing the full flow — simulated webhook → agent response → Deal Card appears on dashboard.
**Where in project:** `playwright.config.ts`, test files.

### `youtube-transcript`
**Trigger:** YouTube URLs.
**Use for:** N/A for this project.

---

## Plugins (Marketplace)

### `commit-commands` (claude-plugins-official)
**Commands:** `/commit`, `/commit-push-pr`, `/clean_gone`
**Use for:** Fast git workflow during hackathon. One-command commits and PR creation.
**Status:** Installed, needs session restart to load.

### `feature-dev` (claude-plugins-official)
**Commands:** `/feature-dev`
**Use for:** 7-phase structured feature development with codebase analysis and architecture agents.
**Status:** Installed, needs session restart to load.

### `frontend-design` (claude-plugins-official)
**Commands:** Auto-invokes on frontend work.
**Use for:** Bold, production-grade UI design guidance. Typography, animations, visual details.
**Status:** Not yet available in marketplace — use `react-best-practices` skill instead.

### `security-guidance` (claude-plugins-official)
**Commands:** Auto-runs as PreToolUse hook.
**Use for:** Catches API key leaks, command injection, XSS, eval usage. Critical for Twilio + Claude API key handling.
**Status:** Not yet available in marketplace — manually review `.env` usage.

---

## MCP Skills (from mcpservers.org)

### MCP Builder (Anthropic)
**Use for:** Building custom MCP server integrations if needed post-hackathon.
**Priority:** Post-MVP.

### Database Schema Designer (softaworks)
**Use for:** Production-ready schema design for SQL databases.
**Priority:** Post-MVP (SQLite schema is simple enough).

### Code Review (Zapier)
**Use for:** Comprehensive code quality, security, and performance analysis.
**Priority:** Post-MVP polish.

### Sentry Tracing + Logging (Sentry)
**Use for:** Production monitoring for Express backend.
**Priority:** Post-MVP.

---

## Quick Reference

| Task | Skill/Plugin to Use |
|------|-------------------|
| Build Claude qualification agent | `claude-api` skill |
| Optimize React components | `react-best-practices` skill |
| Design SQLite schema | `supabase-postgres` skill (concepts transfer) |
| End-to-end testing | `playwright` skill |
| Git commits | `/commit` (when plugin loads) |
| Security review | Manual `.env` review (plugin pending) |
