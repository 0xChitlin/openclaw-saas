# DeskAgents — Agent Templates

## Overview

DeskAgents uses **templates** to provision pre-configured OpenClaw AI agents for customers. Each template defines a specific use case with a system prompt, tools, scheduled tasks, and environment variables. Customers provide their settings (credentials, preferences, rules), and the template generator produces a complete agent configuration.

## Architecture

```
Customer Settings  ──►  Template Generator  ──►  OpenClaw Agent Config  ──►  data/agents/{customerId}.json
                            │
                    src/lib/templates/
```

### Files

| File | Purpose |
|------|---------|
| `src/lib/schemas/agent-config.ts` | TypeScript types, validation, template registry |
| `src/lib/templates/index.ts` | Template index with `listTemplates()` and `getTemplate()` |
| `src/lib/templates/email-manager.ts` | Email Manager template |
| `src/lib/templates/customer-support.ts` | Customer Support template |
| `src/lib/templates/kintone-automation.ts` | Kintone Automation template |
| `src/app/api/provision/route.ts` | Provisioning API endpoint |

## Available Templates

### 1. Email Manager (`email-manager`)

**Tier:** Professional

An AI agent that monitors an email inbox, categorizes messages, drafts replies, and sends daily digests.

**Features:**
- IMAP inbox monitoring (every 5 minutes)
- Smart categorization: urgent, follow-up, newsletter, spam, other
- Auto-draft replies for specified categories
- Daily digest email via SMTP
- Urgent item notifications

**Required Settings:**

```typescript
{
  imap: {
    host: string;       // e.g. "imap.gmail.com"
    port: number;       // e.g. 993
    user: string;       // email address
    password: string;   // app password
    tls: boolean;       // true for most providers
  },
  smtp: {
    host: string;       // e.g. "smtp.gmail.com"
    port: number;       // e.g. 587
    user: string;
    password: string;
    tls: boolean;
  }
}
```

**Optional Settings:**

| Field | Type | Description |
|-------|------|-------------|
| `categories` | `EmailCategory[]` | Which categories to use (defaults to all) |
| `digestSchedule` | `ScheduleConfig` | When to send digest (default: 6 PM ET daily) |
| `urgentNotification` | `NotificationChannel` | Where to send urgent alerts |
| `customRules` | `string[]` | Plain-language categorization rules |
| `autoDraftCategories` | `EmailCategory[]` | Categories to auto-draft replies for |

---

### 2. Customer Support (`customer-support`)

**Tier:** Professional

An AI agent that handles customer inquiries using your knowledge base, with smart escalation and SLA tracking.

**Features:**
- Email or chat widget monitoring (every 2 minutes)
- Knowledge base / FAQ integration
- Keyword-based and timeout-based escalation
- Weekly SLA report
- Business hours awareness
- Customizable tone and style

**Required Settings:**

```typescript
{
  inbox: {
    type: "email" | "chat-widget";
    config: { /* IMAP config or widget endpoint */ };
  },
  knowledgeBase: {
    content?: string;   // Inline FAQ text
    url?: string;       // URL to fetch KB from
    files?: string[];   // File paths to KB docs
  },
  escalation: {
    target: {
      type: "email" | "webhook" | "slack";
      target: string;
    };
    triggerKeywords?: string[];
    timeoutMinutes?: number;
  }
}
```

**Optional Settings:**

| Field | Type | Description |
|-------|------|-------------|
| `targetResponseTimeMinutes` | `number` | SLA target (default: 30) |
| `businessHours` | `object` | Start/end times, timezone, working days |
| `responseStyle` | `string` | Tone instructions for the agent |

---

### 3. Kintone Automation (`kintone-automation`)

**Tier:** Enterprise

An AI agent that connects to Kintone to process records, automate approvals, and generate reports.

**Features:**
- Kintone API integration
- Rule-based record processing (every 15 minutes)
- Approval workflow with auto-approve conditions
- Weekly summary reports
- Multi-app support

**Required Settings:**

```typescript
{
  kintone: {
    subdomain: string;    // e.g. "mycompany"
    apiToken: string;     // Kintone API token
    appIds: number[];     // App IDs to monitor
  },
  processingRules: string[]  // Plain-language rules
}
```

**Optional Settings:**

| Field | Type | Description |
|-------|------|-------------|
| `approvalWorkflow` | `object` | Enable approvals with status field, approvers, auto-approve conditions |
| `reportSchedule` | `ScheduleConfig` | When to generate reports (default: Monday 9 AM JST) |
| `reportDelivery` | `NotificationChannel` | Where to send reports |
| `reportFields` | `string[]` | Which fields to include in reports |

---

## Provisioning API

### `POST /api/provision`

Provision a new agent from a template.

**Request Body:**

```json
{
  "customerId": "cust_abc123",
  "template": "email-manager",
  "settings": {
    "imap": {
      "host": "imap.gmail.com",
      "port": 993,
      "user": "user@example.com",
      "password": "app-password",
      "tls": true
    },
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "user": "user@example.com",
      "password": "app-password",
      "tls": true
    },
    "urgentNotification": {
      "type": "slack",
      "target": "#urgent-emails"
    }
  }
}
```

**Success Response (201):**

```json
{
  "success": true,
  "agentId": "em-abc123-xyz789",
  "config": { /* full OpenClawAgentConfig */ }
}
```

**Error Response (400/404/500):**

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

**Notes:**
- Multiple agents can be provisioned per customer (stored as an array).
- Configs are saved to `data/agents/{customerId}.json`.
- Sensitive values (passwords, API tokens) are stored in the `env` block, not in tool configs.

---

## Creating a New Template

1. **Create the template file** at `src/lib/templates/{name}.ts`:

```typescript
import type {
  OpenClawAgentConfig,
  CustomerSettings,
  TemplateMetadata,
} from "@/lib/schemas/agent-config";

// Define metadata
export const myTemplateMetadata: TemplateMetadata = {
  name: "my-template",
  displayName: "My Template",
  description: "What this template does.",
  tier: "professional",
  requiredSettings: ["field1", "field2"],
  features: ["Feature 1", "Feature 2"],
};

// Define the customer settings type
interface MyTemplateSettings {
  field1: string;
  field2: { /* ... */ };
}

// Export the generator
export function generateMyTemplateConfig(
  customerId: string,
  customerSettings: CustomerSettings
): OpenClawAgentConfig {
  const settings = customerSettings as MyTemplateSettings;

  return {
    agentId: `mt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
    customerId,
    template: "my-template" as any, // Add to TemplateName union first
    name: "My Template Agent",
    description: "...",
    model: "anthropic/claude-sonnet-4-20250514",
    systemPrompt: "...",
    tools: [],
    schedules: [],
    env: {},
    status: "provisioning",
    createdAt: new Date().toISOString(),
    tier: "professional",
    customerSettings: settings,
  };
}
```

2. **Add the template name** to the `TemplateName` union in `src/lib/schemas/agent-config.ts`.

3. **Add the settings type** to the `CustomerSettings` union.

4. **Register in the index** at `src/lib/templates/index.ts`:

```typescript
import { generateMyTemplateConfig, myTemplateMetadata } from "./my-template";

// Add to the templates record:
"my-template": {
  metadata: myTemplateMetadata,
  generate: generateMyTemplateConfig,
},
```

5. **Type-check:** Run `npx tsc --noEmit` to verify everything compiles.

---

## Config Structure

Every generated `OpenClawAgentConfig` contains:

| Field | Description |
|-------|-------------|
| `agentId` | Unique identifier (prefix indicates template) |
| `customerId` | Owner of this agent |
| `template` | Which template generated this config |
| `name` | Human-readable name |
| `model` | LLM model to use |
| `systemPrompt` | Full system prompt with instructions |
| `tools` | Array of enabled tools with configs |
| `schedules` | Cron-based scheduled tasks |
| `env` | Environment variables (secrets go here) |
| `status` | Current status (provisioning → active) |
| `tier` | Pricing tier |
| `customerSettings` | Raw settings for re-generation |
