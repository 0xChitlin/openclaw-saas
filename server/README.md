# DeskAgents Runtime Server

The backend that actually runs AI agents for customers.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Build
npm run build

# Start
./start.sh
# or: npm start
```

Server runs on `http://localhost:4000`.

## API Endpoints

### Public
- `GET /api/health` — Health check
- `POST /api/auth/login` — Get JWT token
- `POST /api/provision` — Create customer + agent (from Stripe webhook)

### Admin (JWT required, admin role)
- `GET /api/admin/customers` — List all customers
- `GET /api/admin/agents` — List all agents with status
- `POST /api/admin/agents/:id/start` — Start an agent
- `POST /api/admin/agents/:id/stop` — Stop an agent
- `POST /api/admin/agents/:id/restart` — Restart an agent
- `GET /api/admin/agents/:id/logs` — Get agent logs
- `GET /api/admin/stats` — Dashboard stats

### Customer (JWT required, customer role)
- `GET /api/customer/agent` — Get my agent status
- `GET /api/customer/logs` — My agent's recent activity
- `PATCH /api/customer/agent` — Pause/resume my agent
- `POST /api/customer/integrations` — Add integration

## Default Admin Login
- Email: `admin@deskagents.com`
- Password: Value of `ADMIN_PASSWORD` env var (default: `deskagents-admin-2024`)

## Architecture

```
server/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── db/
│   │   ├── schema.sql        # SQLite schema
│   │   └── init.ts           # Database initialization
│   ├── agents/
│   │   ├── manager.ts        # Agent lifecycle manager
│   │   └── workers/
│   │       ├── email-agent.ts     # Email monitoring + categorization
│   │       ├── support-agent.ts   # Auto-reply support agent
│   │       └── scheduler-agent.ts # Scheduled tasks (cron)
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication
│   └── routes/
│       ├── auth.ts           # Login endpoint
│       ├── admin.ts          # Admin management API
│       ├── customer.ts       # Customer self-service API
│       ├── provision.ts      # Agent provisioning
│       └── health.ts         # Health check
├── data/                     # SQLite database (auto-created)
├── package.json
├── tsconfig.json
├── Dockerfile
├── start.sh
└── .env.example
```

## Agent Types

### Email Manager
- Connects to IMAP inbox
- Polls for new emails every 5 minutes
- Categorizes: urgent, follow-up, newsletter, spam, general
- Sends daily digest email

### Customer Support
- Monitors inbox for support emails
- Auto-replies using FAQ matching
- Escalates unmatched questions to owner
- Tracks response times

### Scheduler
- Runs cron-based scheduled tasks
- Daily activity reports
- Weekly summaries
- Custom scheduled tasks

## Docker

```bash
# From project root
docker-compose up --build
```

This starts both the Next.js frontend (port 3000) and the Express backend (port 4000).
