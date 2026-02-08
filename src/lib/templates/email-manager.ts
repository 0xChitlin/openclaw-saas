/**
 * Email Manager Template
 *
 * Generates an OpenClaw agent config that:
 * - Monitors inbox via IMAP
 * - Categorizes emails (urgent, follow-up, newsletter, spam)
 * - Drafts replies for common patterns
 * - Sends daily digest summary
 * - Flags urgent items for immediate notification
 */

import type {
  OpenClawAgentConfig,
  EmailManagerSettings,
  CustomerSettings,
  TemplateMetadata,
} from "@/lib/schemas/agent-config";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const emailManagerMetadata: TemplateMetadata = {
  name: "email-manager",
  displayName: "Email Manager",
  description:
    "AI agent that monitors your inbox, categorizes emails, drafts replies, and sends a daily digest. Never miss an urgent message again.",
  tier: "professional",
  requiredSettings: ["imap", "smtp"],
  features: [
    "IMAP inbox monitoring",
    "Smart email categorization (urgent, follow-up, newsletter, spam)",
    "Auto-draft replies for common patterns",
    "Daily digest summary email",
    "Urgent item notifications",
    "Custom categorization rules",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateAgentId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `em-${ts}-${rand}`;
}

function modelForTier(tier: string): string {
  switch (tier) {
    case "starter":
      return "anthropic/claude-sonnet-4-20250514";
    case "enterprise":
      return "anthropic/claude-opus-4-0-20250714";
    default:
      return "anthropic/claude-sonnet-4-20250514";
  }
}

function buildSystemPrompt(settings: EmailManagerSettings): string {
  const categories = settings.categories ?? [
    "urgent",
    "follow-up",
    "newsletter",
    "spam",
    "other",
  ];

  const customRulesBlock = settings.customRules?.length
    ? `\n\n## Custom Rules\n${settings.customRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
    : "";

  const draftBlock = settings.autoDraftCategories?.length
    ? `\n\n## Auto-Draft\nDraft reply suggestions for emails categorised as: ${settings.autoDraftCategories.join(", ")}.`
    : "";

  return `You are an Email Manager AI agent for a DeskAgents customer.

## Your Job
1. Monitor the connected IMAP inbox for new messages.
2. Categorise every incoming email into one of: ${categories.join(", ")}.
3. For emails marked "urgent", immediately flag them and notify the customer.
4. Produce a daily digest summarising all received emails grouped by category.
5. When asked, draft professional replies matching the customer's tone.${customRulesBlock}${draftBlock}

## Guidelines
- Be concise but thorough in your digest.
- Never send a reply on behalf of the customer without explicit approval.
- Respect privacy — do not log or share email content outside this system.
- When uncertain about categorisation, default to "other" and mention it in the digest.`;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function generateEmailManagerConfig(
  customerId: string,
  customerSettings: CustomerSettings
): OpenClawAgentConfig {
  const settings = customerSettings as EmailManagerSettings;

  const digestSchedule = settings.digestSchedule ?? {
    cron: "0 18 * * *", // 6 PM daily
    timezone: "America/New_York",
  };

  return {
    agentId: generateAgentId(),
    customerId,
    template: "email-manager",
    name: "Email Manager",
    description: "Monitors inbox, categorizes emails, drafts replies, sends daily digest.",
    model: modelForTier("professional"),
    systemPrompt: buildSystemPrompt(settings),
    tools: [
      {
        name: "imap",
        enabled: true,
        config: {
          host: settings.imap.host,
          port: settings.imap.port,
          user: settings.imap.user,
          tls: settings.imap.tls,
          // Password injected via env
        },
      },
      {
        name: "smtp",
        enabled: true,
        config: {
          host: settings.smtp.host,
          port: settings.smtp.port,
          user: settings.smtp.user,
          tls: settings.smtp.tls,
        },
      },
      {
        name: "web_search",
        enabled: false,
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
        cron: "*/5 * * * *", // every 5 minutes
        timezone: digestSchedule.timezone,
        task: "Check IMAP inbox for new messages. Categorise and process any new emails. Flag urgent items.",
      },
      {
        name: "daily-digest",
        cron: digestSchedule.cron,
        timezone: digestSchedule.timezone,
        task: "Generate and send the daily email digest via SMTP to the customer.",
      },
    ],
    env: {
      IMAP_PASSWORD: settings.imap.password,
      SMTP_PASSWORD: settings.smtp.password,
      NOTIFICATION_TARGET: settings.urgentNotification?.target ?? "",
      NOTIFICATION_TYPE: settings.urgentNotification?.type ?? "email",
    },
    status: "provisioning",
    createdAt: new Date().toISOString(),
    tier: "professional",
    customerSettings: settings,
  };
}
