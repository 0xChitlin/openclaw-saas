/**
 * Kintone Automation Template
 *
 * Generates an OpenClaw agent config that:
 * - Connects to Kintone workspace
 * - Processes records based on rules
 * - Automates approval workflows
 * - Generates weekly reports
 */

import type {
  OpenClawAgentConfig,
  KintoneAutomationSettings,
  CustomerSettings,
  TemplateMetadata,
} from "@/lib/schemas/agent-config";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const kintoneAutomationMetadata: TemplateMetadata = {
  name: "kintone-automation",
  displayName: "Kintone Automation",
  description:
    "AI agent that connects to your Kintone workspace to process records, automate approval workflows, and generate weekly reports.",
  tier: "enterprise",
  requiredSettings: ["kintone", "processingRules"],
  features: [
    "Kintone API integration",
    "Rule-based record processing",
    "Approval workflow automation",
    "Auto-approve based on conditions",
    "Weekly summary reports",
    "Multi-app support",
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateAgentId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `ka-${ts}-${rand}`;
}

function buildSystemPrompt(settings: KintoneAutomationSettings): string {
  const rulesBlock = settings.processingRules
    .map((r, i) => `${i + 1}. ${r}`)
    .join("\n");

  const approvalBlock = settings.approvalWorkflow?.enabled
    ? `\n\n## Approval Workflow
- Status field: "${settings.approvalWorkflow.statusField}"
- Notify approvers when a record needs approval.
${
  settings.approvalWorkflow.autoApproveConditions?.length
    ? `- Auto-approve when: ${settings.approvalWorkflow.autoApproveConditions.join("; ")}`
    : "- No auto-approve rules configured."
}`
    : "";

  const reportBlock = settings.reportFields?.length
    ? `\n\n## Reports\nInclude these fields in weekly reports: ${settings.reportFields.join(", ")}`
    : "";

  return `You are a Kintone Automation AI agent for a DeskAgents customer.

## Your Job
1. Connect to the customer's Kintone workspace via the API.
2. Monitor apps: ${settings.kintone.appIds.join(", ")}.
3. Process records according to the rules below.
4. Handle approval workflows when configured.
5. Generate weekly summary reports.

## Processing Rules
${rulesBlock}${approvalBlock}${reportBlock}

## Guidelines
- Never delete records without explicit approval.
- Log every action taken for audit purposes.
- If a rule is ambiguous, skip the record and flag it for human review.
- Respect Kintone API rate limits (10 requests/second).`;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function generateKintoneConfig(
  customerId: string,
  customerSettings: CustomerSettings
): OpenClawAgentConfig {
  const settings = customerSettings as KintoneAutomationSettings;

  const reportSchedule = settings.reportSchedule ?? {
    cron: "0 9 * * 1", // Monday 9am
    timezone: "Asia/Tokyo",
  };

  return {
    agentId: generateAgentId(),
    customerId,
    template: "kintone-automation",
    name: "Kintone Automation",
    description:
      "Processes Kintone records, automates approvals, generates weekly reports.",
    model: "anthropic/claude-sonnet-4-20250514",
    systemPrompt: buildSystemPrompt(settings),
    tools: [
      {
        name: "kintone-api",
        enabled: true,
        config: {
          subdomain: settings.kintone.subdomain,
          appIds: settings.kintone.appIds,
          // API token injected via env
        },
      },
      {
        name: "web_fetch",
        enabled: true,
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
        name: "process-records",
        cron: "*/15 * * * *", // every 15 minutes
        timezone: reportSchedule.timezone,
        task: "Check Kintone apps for new/updated records. Apply processing rules. Handle approvals.",
      },
      {
        name: "weekly-report",
        cron: reportSchedule.cron,
        timezone: reportSchedule.timezone,
        task: "Generate weekly summary report of all processed records, approvals, and exceptions.",
      },
    ],
    env: {
      KINTONE_SUBDOMAIN: settings.kintone.subdomain,
      KINTONE_API_TOKEN: settings.kintone.apiToken,
      KINTONE_APP_IDS: settings.kintone.appIds.join(","),
      REPORT_TARGET: settings.reportDelivery?.target ?? "",
      REPORT_TYPE: settings.reportDelivery?.type ?? "email",
    },
    status: "provisioning",
    createdAt: new Date().toISOString(),
    tier: "enterprise",
    customerSettings: settings,
  };
}
