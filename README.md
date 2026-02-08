# DeskAgents — Your AI Employees

A Next.js SaaS landing page with Stripe checkout integration for DeskAgents, a managed AI employee service.

## Features

- 🎨 Dark-themed landing page with pricing, features, and use cases
- 💳 Stripe Checkout integration (subscription billing)
- 📋 Onboarding flow after successful payment
- 🔔 Stripe webhook handling for payment events
- 📝 Waitlist signup (legacy)

## Pricing Tiers

| Plan | Price | Product Name |
|------|-------|-------------|
| Individual | $49/mo | DeskAgent Individual |
| Business | $199/mo | DeskAgent Business |
| Enterprise | $999/mo | DeskAgent Enterprise (Contact Us) |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Then fill in your Stripe keys:

- `STRIPE_SECRET_KEY` — from [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from the same page
- `STRIPE_WEBHOOK_SECRET` — from [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)

### 3. Run the dev server

```bash
npm run dev
```

### 4. Set up Stripe webhooks (for local dev)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret it provides into your `.env.local`.

### 5. Deploy to Vercel

```bash
vercel --prod
```

Make sure to set the environment variables in your Vercel project settings.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/checkout` | POST | Creates a Stripe Checkout session |
| `/api/webhooks/stripe` | POST | Handles Stripe webhook events |
| `/api/onboarding` | POST | Saves customer onboarding data |
| `/api/waitlist` | POST/GET | Waitlist signup (legacy) |

## Pages

- `/` — Landing page with pricing
- `/success` — Post-payment onboarding page

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Stripe (Checkout Sessions, Webhooks)
- TypeScript

## Data Storage

Customer and waitlist data is stored in `data/` as JSON files. For production, replace with a proper database.
