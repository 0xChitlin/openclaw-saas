# OpenClaw SaaS — Your AI Employee. No Code Required.

Managed AI agents for non-technical users. Built on top of [OpenClaw](https://github.com/openclaw/openclaw).

## What Is This?

OpenClaw is a powerful open-source AI agent — but it requires technical skills to set up and run. **OpenClaw SaaS** makes that power accessible to everyone.

We provide **fully managed AI agents** that handle:
- 📧 Email management & auto-replies
- 📅 Calendar & scheduling
- 💬 Customer support (WhatsApp, Telegram, email)
- 📊 Data entry & CRM automation (Kintone, spreadsheets)
- 🔄 Workflow automation

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Data:** JSON file (MVP) → Supabase/PostgreSQL (production)
- **Deployment:** Vercel-ready
- **AI Engine:** OpenClaw (managed instances)

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd openclaw-saas
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### Build

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npx vercel
```

Or connect the GitHub repo directly in the [Vercel Dashboard](https://vercel.com).

> **Note:** For production, replace the JSON file storage with Supabase or another database. The JSON file approach is for MVP/demo purposes only.

## Project Structure

```
openclaw-saas/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── waitlist/
│   │   │       └── route.ts        # Waitlist API endpoint
│   │   ├── globals.css              # Global styles + animations
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing page
│   └── components/
│       ├── Navbar.tsx               # Fixed navigation
│       ├── Hero.tsx                 # Hero section
│       ├── Features.tsx             # Feature grid
│       ├── UseCases.tsx             # Target audience cards
│       ├── HowItWorks.tsx           # 4-step process
│       ├── Pricing.tsx              # 3-tier pricing
│       ├── Waitlist.tsx             # Signup form
│       └── Footer.tsx               # Footer
├── data/
│   └── waitlist.json                # Waitlist storage (MVP)
├── ARCHITECTURE.md                  # System architecture doc
└── README.md                        # This file
```

## Pricing

| Plan | Price | Target |
|------|-------|--------|
| Individual | $49/mo | Solopreneurs & freelancers |
| Business | $199/mo | Growing businesses |
| Enterprise | $999+/mo | Agencies & large teams |

## Roadmap

### Phase 1 — Landing Page + Waitlist ✅
- [x] Professional landing page
- [x] Waitlist signup with use case collection
- [x] Mobile responsive design
- [x] Vercel-ready deployment

### Phase 2 — Auth + Dashboard
- [ ] User authentication (NextAuth / Clerk)
- [ ] Customer dashboard
- [ ] Agent status monitoring
- [ ] Activity logs

### Phase 3 — Managed OpenClaw Instances
- [ ] Provisioning system (one agent per customer)
- [ ] Docker-based isolation
- [ ] Kintone integration template
- [ ] Email + calendar connections

### Phase 4 — Billing & Scale
- [ ] Stripe subscription integration
- [ ] Usage tracking & limits
- [ ] Multi-agent support (Business/Enterprise)
- [ ] WhatsApp & Telegram integration per customer

### Phase 5 — Enterprise
- [ ] SSO / SAML
- [ ] White-label option
- [ ] API access
- [ ] Custom integrations
- [ ] SOC 2 compliance

## License

Proprietary. All rights reserved.
