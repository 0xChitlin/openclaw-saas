# DeskAgents — Agent Runtime Backend

Backend server for DeskAgents SaaS. Manages autonomous agent workers (email categorizer, support auto-responder, scheduler) with a REST API for administration and customer self-service.

## Architecture

```
┌─────────────────────────────────────────┐
│            Express REST API             │
│  /api/admin  /api/customer  /api/health │
├─────────────────────────────────────────┤
│            Agent Manager                │
│  start / stop / restart / healthCheck   │
├──────────┬──────────┬───────────────────┤
│  Email   │ Support  │    Scheduler      │
│  Worker  │ Worker   │    Worker         │
│ (IMAP+   │ (IMAP+   │  (node-cron +    │
│  classify)│ auto-reply)│  email digest) │
├──────────┴──────────┴───────────────────┤
│        SQLite (better-sqlite3)          │
│  customers │ agents │ logs │ integrations│
└─────────────────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Health
- `GET /api/health` — Server health + agent runtime status

### Admin (requires `x-api-key` header or admin JWT)
- `GET /api/admin/customers` — List all customers
- `GET /api/admin/agents` — List all agents with runtime status
- `POST /api/admin/agents/:id/start` — Start an agent
- `POST /api/admin/agents/:id/stop` — Stop an agent
- `POST /api/admin/agents/:id/restart` — Restart an agent
- `GET /api/admin/agents/:id/logs?type=info|error|action&limit=50` — Agent logs
- `GET /api/admin/stats` — Dashboard stats

### Customer (requires JWT Bearer token)
- `GET /api/customer/agent` — Get your agent
- `GET /api/customer/logs` — Get your agent's logs
- `PATCH /api/customer/agent` — Pause/resume (`{ "action": "pause" | "resume" }`)
- `POST /api/customer/integrations` — Add integration

### Provisioning (admin auth)
- `POST /api/provision` — Create customer + agent

## Agent Templates

| Template | Description |
|----------|-------------|
| `email` / `email-agent` | IMAP inbox monitor — categorizes emails (urgent, newsletter, billing, support) |
| `support` / `support-agent` | Auto-reply FAQ support bot with escalation |
| `scheduler` / `scheduler-agent` | Cron-based scheduled jobs (daily digest, weekly reports) |

## Docker

```bash
# Build and run
docker-compose up -d

# Or build manually
docker build -t deskagents-server .
docker run -p 4000:4000 -v deskagents-data:/app/data deskagents-server
```

## Tech Stack

- **Runtime:** Node.js 20+, TypeScript
- **Framework:** Express 4
- **Database:** SQLite via better-sqlite3
- **IMAP:** imapflow
- **SMTP:** nodemailer
- **Scheduler:** node-cron
- **Auth:** JWT + API key
