# DeskAgents — Agent Runtime Backend

The production backend that manages AI agents for DeskAgents SaaS customers.

## Architecture

```
server/
├── src/
│   ├── index.ts              # Express server (port 4000)
│   ├── db/
│   │   ├── schema.sql        # SQLite schema
│   │   └── init.ts           # Database initialization + helpers
│   ├── agents/
│   │   ├── manager.ts        # Agent lifecycle manager (start/stop/restart/health)
│   │   └── workers/
│   │       ├── email-agent.ts     # IMAP email monitoring + categorization + daily digest
│   │       ├── support-agent.ts   # Auto-reply support + FAQ + escalation
│   │       └── scheduler-agent.ts # Cron-based scheduled tasks + reports
│   ├── routes/
│   │   ├── admin.ts          # Admin API (JWT protected)
│   │   ├── customer.ts       # Customer API (JWT protected)
│   │   ├── provision.ts      # Customer + agent provisioning
│   │   ├── health.ts         # Health check endpoint
│   │   └── auth.ts           # Login/auth
│   └── middleware/
│       └── auth.ts           # JWT auth middleware
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

Server starts on `http://localhost:4000`.

## API Endpoints

### Public
- `GET /api/health` — Health check
- `POST /api/auth/login` — Login (admin or customer)
- `POST /api/provision` — Create customer + agent

### Admin (JWT required, admin role)
- `GET /api/admin/customers` — List all customers
- `GET /api/admin/agents` — List all agents with runtime status
- `POST /api/admin/agents/:id/start` — Start an agent
- `POST /api/admin/agents/:id/stop` — Stop an agent
- `POST /api/admin/agents/:id/restart` — Restart an agent
- `GET /api/admin/agents/:id/logs` — Get agent logs
- `GET /api/admin/stats` — Dashboard statistics

### Customer (JWT required, customer role)
- `GET /api/customer/agent` — My agent status
- `GET /api/customer/logs` — My agent activity logs
- `PATCH /api/customer/agent` — Pause/resume my agent
- `POST /api/customer/integrations` — Add integration

## Agent Templates

### email-manager
Monitors IMAP inbox, categorizes emails (urgent/follow-up/newsletter/spam), sends daily digest.

### customer-support
Auto-replies to common support questions using FAQ matching, escalates unknown issues.

### scheduler
Runs cron-based tasks — daily reports, weekly summaries, custom schedules.

## Default Admin

On first run, a default admin is created:
- Email: `admin@deskagents.com`
- Password: `deskagents-admin-2024` (change via `ADMIN_PASSWORD` env var)

## Docker

```bash
# Build and run with docker-compose (from project root)
docker-compose up --build
```

## Environment Variables

See `.env.example` for all options.
