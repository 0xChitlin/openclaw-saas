# Architecture — OpenClaw SaaS

## Overview

OpenClaw SaaS is a managed service layer built **on top of** the open-source OpenClaw AI agent framework. Each customer gets their own isolated OpenClaw instance, pre-configured and managed by us.

```
┌─────────────────────────────────────────────────┐
│                  Customer Layer                  │
│  (Dashboard, Onboarding, Billing, Support)      │
├─────────────────────────────────────────────────┤
│               Orchestration Layer                │
│  (Instance Manager, Config, Monitoring)          │
├─────────────────────────────────────────────────┤
│              OpenClaw Instances                   │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │Agent1│  │Agent2│  │Agent3│  │Agent N│       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
├─────────────────────────────────────────────────┤
│              Infrastructure Layer                 │
│  (Docker, Networking, Storage, Secrets)           │
└─────────────────────────────────────────────────┘
```

---

## 1. Managed OpenClaw Instances

### One Instance Per Customer

Each paying customer gets a **dedicated OpenClaw instance** running in an isolated container.

```
Customer signs up → Provisioning service creates:
  1. Docker container with OpenClaw installed
  2. Isolated workspace directory
  3. Encrypted secrets vault (API keys, credentials)
  4. Configured messaging channels (Telegram/WhatsApp)
  5. Pre-loaded automation templates
```

### Instance Architecture

```
Per-Customer Container:
├── openclaw/                  # OpenClaw installation
│   ├── .openclaw/
│   │   ├── workspace/
│   │   │   ├── SOUL.md       # Customer-specific personality/rules
│   │   │   ├── AGENTS.md     # Agent configuration
│   │   │   └── TOOLS.md      # Connected services & credentials
│   │   └── config.yaml       # OpenClaw config (model, channels)
│   └── skills/               # Installed automation skills
├── secrets/                   # Encrypted credential store
└── logs/                      # Activity logs (synced to dashboard)
```

### Isolation Model

| Concern | Solution |
|---------|----------|
| Process isolation | Docker containers with resource limits |
| Network isolation | Private networks, egress filtering |
| Data isolation | Separate volumes, encrypted at rest |
| Secret isolation | Per-customer vault (HashiCorp Vault / AWS Secrets Manager) |
| Cost isolation | Resource quotas per plan tier |

### Scaling Strategy

- **Individual plan:** Shared host, lightweight containers (256MB RAM, 0.5 CPU)
- **Business plan:** Dedicated containers, more resources (1GB RAM, 1 CPU)
- **Enterprise plan:** Dedicated VM or host, custom resource allocation

---

## 2. Authentication Flow

### Customer Signup → Agent Provisioning

```
1. Customer visits landing page
2. Signs up (email/password or OAuth)
3. Onboarding wizard:
   a. "What's your business?" (type, size)
   b. "What do you want to automate?" (selects from templates)
   c. "Connect your tools" (guided OAuth flows)
4. System provisions OpenClaw instance:
   a. Spins up Docker container
   b. Installs selected skill templates
   c. Configures connected integrations
   d. Sets up messaging channel (Telegram bot / WhatsApp)
5. Customer gets:
   a. Dashboard access (activity log, settings)
   b. Telegram/WhatsApp bot link to chat with their agent
   c. Email forwarding address for agent-managed mail
```

### Auth Stack

```
┌──────────────────┐
│    Frontend       │  Next.js + NextAuth/Clerk
├──────────────────┤
│    Auth Provider  │  Clerk (preferred) or NextAuth
├──────────────────┤
│    Session Store  │  JWT + Redis
├──────────────────┤
│    API Auth       │  Bearer tokens + API keys
└──────────────────┘
```

### User Roles

| Role | Access |
|------|--------|
| Customer (Owner) | Full dashboard, agent config, billing |
| Customer (Member) | View activity, chat with agent |
| Admin (Internal) | All instances, system config, support |

---

## 3. Messaging Integration

### Per-Customer Channels

Each customer gets their own messaging endpoints:

#### Telegram
```
1. System creates a Telegram bot per customer (via BotFather API)
   - Or: Customer uses their own bot token
2. Bot is configured as OpenClaw's channel
3. Customer (and their team) chat with their agent via Telegram
4. Webhook routes messages to correct container
```

#### WhatsApp (Business API)
```
1. Customer connects their WhatsApp Business number
2. System configures webhook → customer's OpenClaw instance
3. Customer support messages route through the agent
4. Agent responds, escalates to human when needed
```

#### Email
```
1. Customer gets a forwarding address: agent-{id}@openclaw-saas.com
2. Incoming emails forward to customer's OpenClaw instance
3. Agent reads, categorizes, and drafts replies
4. Customer approves or agent auto-sends (based on confidence)
```

### Message Routing Architecture

```
┌─────────────────────────────────────────────┐
│              Ingress Gateway                 │
│  (Telegram webhook, WhatsApp API, SMTP)     │
├─────────────────────────────────────────────┤
│              Message Router                   │
│  Routes by: bot_token / phone_number / email │
├─────────┬─────────┬─────────┬───────────────┤
│ Agent 1 │ Agent 2 │ Agent 3 │   Agent N     │
│ (cust1) │ (cust2) │ (cust3) │   (custN)     │
└─────────┴─────────┴─────────┴───────────────┘
```

---

## 4. Billing Integration (Stripe)

### Subscription Model

```
┌──────────────────────────────────────────────┐
│                 Stripe                        │
│                                              │
│  Products:                                   │
│  ├── Individual ($49/mo)                     │
│  ├── Business ($199/mo)                      │
│  └── Enterprise ($999/mo, custom)            │
│                                              │
│  Webhooks → Our API:                         │
│  ├── checkout.session.completed → Provision  │
│  ├── customer.subscription.updated → Resize  │
│  ├── customer.subscription.deleted → Deprov. │
│  └── invoice.payment_failed → Notify + Grace │
└──────────────────────────────────────────────┘
```

### Billing Flow

```
1. Customer selects plan on pricing page
2. Redirected to Stripe Checkout
3. On success: webhook triggers provisioning
4. Instance spins up, customer gets access
5. Monthly billing via Stripe
6. Failed payment → 7-day grace period → suspension → deletion (30 days)
```

### Usage Tracking

| Metric | Individual | Business | Enterprise |
|--------|-----------|----------|------------|
| Agents | 1 | 3 | Unlimited |
| Messages/mo | 1,000 | 10,000 | Unlimited |
| Automations | 5 | Unlimited | Unlimited |
| Integrations | 3 | 10 | Unlimited |
| Storage | 1GB | 10GB | Custom |

### Overage Handling

- Soft limit: Warning at 80% usage
- Hard limit: Queue excess messages, notify customer
- Upgrade prompt: "You've hit your limit. Upgrade to Business for unlimited automations."

---

## 5. First Automation Template: Kintone Workflow

### Why Kintone First?

- Large enterprise user base in Japan and growing globally
- Complex workflows that are painful to manage manually
- No existing AI automation solutions
- High willingness to pay for automation

### Kintone Integration Architecture

```
┌───────────────────────────────────────────┐
│              Customer's Agent              │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │     Kintone Skill (OpenClaw)        │  │
│  │                                     │  │
│  │  Capabilities:                      │  │
│  │  ├── Read records from any app      │  │
│  │  ├── Create/update records          │  │
│  │  ├── Trigger on record changes      │  │
│  │  ├── Run custom queries             │  │
│  │  └── Generate reports               │  │
│  └─────────────────────────────────────┘  │
│                    │                       │
│                    ▼                       │
│  ┌─────────────────────────────────────┐  │
│  │       Kintone REST API              │  │
│  │  (customer's subdomain + API token) │  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘
```

### Pre-Built Kintone Workflows

#### 1. Record Processing
```
Trigger: New record in "Leads" app
Action: 
  - AI categorizes lead (hot/warm/cold)
  - Updates status field
  - Sends notification to sales rep
  - Creates follow-up task in "Tasks" app
```

#### 2. Approval Automation
```
Trigger: Record status changes to "Pending Approval"
Action:
  - AI reviews request against rules
  - Auto-approves if within thresholds
  - Routes to manager if escalation needed
  - Sends notification via Telegram/email
```

#### 3. Report Generation
```
Trigger: Scheduled (daily/weekly) or on-demand via chat
Action:
  - Queries Kintone records
  - Generates summary report
  - Sends to customer via Telegram/email
  - Updates dashboard metrics
```

#### 4. Data Sync
```
Trigger: Changes in connected systems (email, calendar)
Action:
  - Syncs customer data to Kintone CRM
  - Updates contact records
  - Logs interactions
  - Maintains data consistency
```

### Kintone Setup Flow (Customer Experience)

```
1. Customer selects "Kintone" in onboarding
2. Enters their Kintone subdomain (e.g., mycompany.kintone.com)
3. Generates API token in Kintone (guided walkthrough)
4. Pastes token into our dashboard
5. System discovers available Kintone apps
6. Customer selects which apps to connect
7. Customer describes desired automations in plain English:
   "When a new lead comes in, categorize it and assign to the right rep"
8. Agent configures itself and starts working
```

---

## 6. Infrastructure

### Production Stack

```
┌─────────────────────────────────────────────┐
│                   Vercel                      │
│  (Next.js frontend, API routes)              │
├─────────────────────────────────────────────┤
│              Railway / Fly.io                 │
│  (Docker containers for OpenClaw instances)  │
├─────────────────────────────────────────────┤
│                  Supabase                     │
│  (PostgreSQL, Auth, Realtime)                │
├─────────────────────────────────────────────┤
│                   Redis                       │
│  (Sessions, rate limiting, queues)           │
├─────────────────────────────────────────────┤
│              Object Storage (S3)              │
│  (Logs, exports, attachments)                │
└─────────────────────────────────────────────┘
```

### Cost Estimates (Per Customer)

| Component | Individual | Business | Enterprise |
|-----------|-----------|----------|------------|
| Compute (container) | $5/mo | $15/mo | $50+/mo |
| AI API (Claude/GPT) | $10/mo | $30/mo | $100+/mo |
| Storage | $0.50/mo | $2/mo | $10+/mo |
| Messaging APIs | $2/mo | $5/mo | $20+/mo |
| **Total COGS** | **~$18/mo** | **~$52/mo** | **~$180/mo** |
| **Revenue** | **$49/mo** | **$199/mo** | **$999/mo** |
| **Gross Margin** | **63%** | **74%** | **82%** |

---

## 7. Security Considerations

- **Data at rest:** AES-256 encryption for all customer data
- **Data in transit:** TLS 1.3 everywhere
- **Secrets management:** HashiCorp Vault or AWS Secrets Manager
- **Access control:** RBAC with principle of least privilege
- **Audit logging:** All agent actions logged and reviewable
- **Customer data isolation:** Separate containers, separate volumes
- **AI safety:** Confidence thresholds, human-in-the-loop for high-risk actions
- **Compliance path:** SOC 2 Type II (target: 6 months post-launch)

---

## 8. Development Phases

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| 1. Landing + Waitlist | Week 1 | Landing page, waitlist collection |
| 2. Auth + Dashboard | Weeks 2-3 | Login, basic dashboard, settings |
| 3. Instance Provisioning | Weeks 4-6 | Docker-based agent deployment |
| 4. Kintone Template | Weeks 7-8 | First working automation |
| 5. Billing | Weeks 9-10 | Stripe integration, plan enforcement |
| 6. Messaging | Weeks 11-12 | Telegram + WhatsApp per customer |
| 7. Beta Launch | Week 13 | First paying customers |
