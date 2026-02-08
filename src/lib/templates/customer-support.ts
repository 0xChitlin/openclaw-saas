/**
 * Customer Support Template
 *
 * Generates an OpenClaw agent config that:
 * - Responds to customer inquiries via email/chat
 * - Uses provided FAQ/knowledge base
 * - Escalates complex issues
 * - Tracks response times
 */

import type {
  OpenClawAgentConfig,
  CustomerSupportSettings,
  CustomerSettings,
  TemplateMetadata,
} from "@/lib/schemas/agent-config";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const customerSupportMetadata: TemplateMetadata = {
  name: "customer-support",
  displayName: "Customer Support Agent",
  description:
    "AI agent that handles customer inquiries, references your knowledge base, escalates complex issues, and tracks response times to meet SLAs.",
  tier: "professional",
  requiredSettings: ["inbox", "knowledgeBase", "escalation"],
  features: [
    "Email and chat widget support",
    "Knowledge base / FAQ integration",
    "Smart escalation with keyword triggers",
    "Response time SLA tracking",
    "Business hours awareness",
    "Customizable tone and style",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateAgentId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `cs-${ts}-${rand}`;
}

function buildSystemPrompt(settings: CustomerSupportSettings): string {
  const styleBlock = settings.responseStyle
    ? `\n\n## Tone & Style\n${settings.responseStyle}`
    : "\n\n## Tone & Style\nBe friendly, professional, and concise. Use the customer's name when available.";

  const escalationKeywords = settings.escalation.triggerKeywords?.length
    ? `\nEscalation trigger keywords: ${settings.escalation.triggerKeywords.join(", ")}`
    : "";

  const slaBlock = settings.targetResponseTimeMinutes
    ? `\n\n## SLA\nTarget first response time: ${settings.targetResponseTimeMinutes} minutes.`
    : "";

  const hoursBlock = settings.businessHours
    ? `\n\n## Business Hours\n${settings.businessHours.start} – ${settings.businessHours.end} (${settings.businessHours.timezone}), days: ${settings.businessHours.days.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}`
    : "";

  return `You are a Customer Support AI agent for a DeskAgents customer.

## Your Job
1. Monitor the connected inbox for new customer inquiries.
2. Search the provided knowledge base to find accurate answers.
3. Respond promptly and helpfully to every inquiry.
4. If you cannot confidently answer, escalate to a human.
5. Track response times for SLA compliance.${styleBlock}

## Escalation Rules
- Escalate when the question is outside your knowledge base.
- Escalate when the customer is upset or requests a human.
- Escalate when the issue involves billing, refunds, or account access.${escalationKeywords}
${settings.escalation.timeoutMinutes ? `- Auto-escalate if unresolved after ${settings.escalation.timeoutMinutes} minutes.` : ""}${slaBlock}${hoursBlock}

## Guidelines
- Never fabricate information. If unsure, say so and escalate.
- Include relevant KB article links when available.
- Log every interaction for response-time tracking.
- Be empathetic and patient.`;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function generateSupportConfig(
  customerId: string,
  customerSettings: CustomerSettings
): OpenClawAgentConfig {
  const settings = customerSettings as CustomerSupportSettings;

  const timezone = settings.businessHours?.timezone ?? "America/New_York";

  return {
    agentId: generateAgentId(),
    customerId,
    template: "customer-support",
    name: "Customer Support Agent",
    description:
      "Handles customer inquiries, references knowledge base, escalates complex issues, tracks SLAs.",
    model: "anthropic/claude-sonnet-4-20250514",
    systemPrompt: buildSystemPrompt(settings),
    tools: [
      {
        name: settings.inbox.type === "email" ? "imap" : "chat-widget",
        enabled: true,
        config: settings.inbox.config,
      },
      {
        name: "knowledge-base",
        enabled: true,
        config: {
          content: settings.knowledgeBase.content ?? null,
          url: settings.knowledgeBase.url ?? null,
          files: settings.knowledgeBase.files ?? [],
        },
      },
      {
        name: "escalation",
        enabled: true,
        config: {
          target: settings.escalation.target.target,
          type: settings.escalation.target.type,
          triggerKeywords: settings.escalation.triggerKeywords ?? [],
          timeoutMinutes: settings.escalation.timeoutMinutes ?? null,
        },
      },
      {
        name: "file_read",
        enabled: true,
      },
      {
        name: "file_write",
        enabled: true,
      },
    ],
    schedules: [
      {
        name: "check-inbox",
        cron: "*/2 * * * *", // every 2 minutes for fast response
        timezone,
        task: "Check inbox for new customer inquiries. Respond using the knowledge base. Escalate if needed.",
      },
      {
        name: "sla-report",
        cron: "0 9 * * 1", // Monday 9am
        timezone,
        task: "Generate weekly SLA report: average response time, tickets handled, escalation rate.",
      },
    ],
    env: {
      ESCALATION_TARGET: settings.escalation.target.target,
      ESCALATION_TYPE: settings.escalation.target.type,
      TARGET_RESPONSE_MINUTES: String(settings.targetResponseTimeMinutes ?? 30),
    },
    status: "provisioning",
    createdAt: new Date().toISOString(),
    tier: "professional",
    customerSettings: settings,
  };
}
