/**
 * Agent Configuration Schema
 *
 * TypeScript types and validation for all DeskAgents agent configurations.
 * These types represent OpenClaw-compatible agent configs generated from templates.
 */

// ---------------------------------------------------------------------------
// Core Types
// ---------------------------------------------------------------------------

/** Supported template names */
export type TemplateName = "email-manager" | "customer-support" | "kintone-automation";

/** Pricing tiers that determine model quality and feature limits */
export type PricingTier = "starter" | "professional" | "enterprise";

/** Status of a provisioned agent */
export type AgentStatus = "provisioning" | "active" | "paused" | "error";

/** Email category labels used by the email-manager template */
export type EmailCategory = "urgent" | "follow-up" | "newsletter" | "spam" | "other";

/** Escalation severity levels */
export type EscalationLevel = "low" | "medium" | "high" | "critical";

// ---------------------------------------------------------------------------
// Schedule & Common Config
// ---------------------------------------------------------------------------

export interface ScheduleConfig {
  /** Cron expression (e.g. "0 9 * * 1-5" for weekdays at 9am) */
  cron: string;
  /** IANA timezone string */
  timezone: string;
}

export interface NotificationChannel {
  type: "email" | "webhook" | "slack";
  target: string; // email address, URL, or Slack channel
}

// ---------------------------------------------------------------------------
// Template-Specific Customer Settings
// ---------------------------------------------------------------------------

export interface EmailManagerSettings {
  /** IMAP connection details */
  imap: {
    host: string;
    port: number;
    user: string;
    password: string;
    tls: boolean;
  };
  /** SMTP for sending replies/digests */
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    tls: boolean;
  };
  /** Categories to monitor — defaults to all if omitted */
  categories?: EmailCategory[];
  /** Schedule for daily digest email */
  digestSchedule?: ScheduleConfig;
  /** Where to send urgent notifications */
  urgentNotification?: NotificationChannel;
  /** Custom rules for categorization (plain-language descriptions) */
  customRules?: string[];
  /** Auto-draft replies for these categories */
  autoDraftCategories?: EmailCategory[];
}

export interface CustomerSupportSettings {
  /** Inbox to monitor for support inquiries */
  inbox: {
    type: "email" | "chat-widget";
    /** For email: IMAP config; for chat-widget: widget endpoint */
    config: Record<string, unknown>;
  };
  /** FAQ / knowledge base content */
  knowledgeBase: {
    /** Plain-text or markdown content */
    content?: string;
    /** URL to fetch KB from */
    url?: string;
    /** File paths to KB documents */
    files?: string[];
  };
  /** Escalation rules */
  escalation: {
    /** Email or webhook to send escalated issues to */
    target: NotificationChannel;
    /** Keywords or conditions that trigger escalation */
    triggerKeywords?: string[];
    /** Auto-escalate after N minutes without resolution */
    timeoutMinutes?: number;
  };
  /** Target response time in minutes */
  targetResponseTimeMinutes?: number;
  /** Business hours for SLA tracking */
  businessHours?: {
    start: string; // "09:00"
    end: string;   // "17:00"
    timezone: string;
    days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  };
  /** Tone/style instructions for the agent */
  responseStyle?: string;
}

export interface KintoneAutomationSettings {
  /** Kintone API connection */
  kintone: {
    subdomain: string;
    apiToken: string;
    /** Specific app IDs to work with */
    appIds: number[];
  };
  /** Processing rules in plain language */
  processingRules: string[];
  /** Approval workflow config */
  approvalWorkflow?: {
    enabled: boolean;
    /** Field name that holds approval status */
    statusField: string;
    /** Approver notification targets */
    approvers: NotificationChannel[];
    /** Auto-approve conditions (plain language) */
    autoApproveConditions?: string[];
  };
  /** Weekly report schedule */
  reportSchedule?: ScheduleConfig;
  /** Where to deliver reports */
  reportDelivery?: NotificationChannel;
  /** Fields to include in reports */
  reportFields?: string[];
}

/** Union of all customer settings by template */
export type CustomerSettings =
  | EmailManagerSettings
  | CustomerSupportSettings
  | KintoneAutomationSettings;

// ---------------------------------------------------------------------------
// OpenClaw Agent Config (output of template generators)
// ---------------------------------------------------------------------------

export interface OpenClawToolConfig {
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface OpenClawAgentConfig {
  /** Unique agent ID (generated during provisioning) */
  agentId: string;
  /** Customer who owns this agent */
  customerId: string;
  /** Which template was used */
  template: TemplateName;
  /** Human-readable agent name */
  name: string;
  /** Agent description */
  description: string;
  /** Model to use (determined by pricing tier) */
  model: string;
  /** System prompt for the agent */
  systemPrompt: string;
  /** Tools the agent has access to */
  tools: OpenClawToolConfig[];
  /** Scheduled tasks (cron-based) */
  schedules: Array<{
    name: string;
    cron: string;
    timezone: string;
    task: string;
  }>;
  /** Environment variables to inject */
  env: Record<string, string>;
  /** Agent status */
  status: AgentStatus;
  /** When the agent was provisioned */
  createdAt: string;
  /** Pricing tier */
  tier: PricingTier;
  /** Raw customer settings (stored for re-generation) */
  customerSettings: CustomerSettings;
}

// ---------------------------------------------------------------------------
// Provisioning Request / Response
// ---------------------------------------------------------------------------

export interface ProvisionRequest {
  customerId: string;
  template: TemplateName;
  settings: CustomerSettings;
}

export interface ProvisionResponse {
  success: boolean;
  agentId?: string;
  config?: OpenClawAgentConfig;
  error?: string;
}

// ---------------------------------------------------------------------------
// Template Generator Signature
// ---------------------------------------------------------------------------

export type TemplateGenerator = (
  customerId: string,
  settings: CustomerSettings
) => OpenClawAgentConfig;

// ---------------------------------------------------------------------------
// Template Metadata
// ---------------------------------------------------------------------------

export interface TemplateMetadata {
  name: TemplateName;
  displayName: string;
  description: string;
  tier: PricingTier;
  requiredSettings: string[];
  features: string[];
}

// ---------------------------------------------------------------------------
// Template Registry
// ---------------------------------------------------------------------------

export interface TemplateRegistryEntry {
  metadata: TemplateMetadata;
  generate: TemplateGenerator;
}

const registry = new Map<TemplateName, TemplateRegistryEntry>();

export function registerTemplate(entry: TemplateRegistryEntry): void {
  registry.set(entry.metadata.name, entry);
}

export function getRegisteredTemplate(name: TemplateName): TemplateRegistryEntry | undefined {
  return registry.get(name);
}

export function listRegisteredTemplates(): TemplateRegistryEntry[] {
  return Array.from(registry.values());
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validate a provision request payload */
export function validateProvisionRequest(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }

  const req = body as Record<string, unknown>;

  if (!req.customerId || typeof req.customerId !== "string") {
    errors.push("customerId is required and must be a string.");
  }

  if (!req.template || typeof req.template !== "string") {
    errors.push("template is required and must be a string.");
  } else {
    const validTemplates: TemplateName[] = [
      "email-manager",
      "customer-support",
      "kintone-automation",
    ];
    if (!validTemplates.includes(req.template as TemplateName)) {
      errors.push(
        `Invalid template "${req.template}". Valid options: ${validTemplates.join(", ")}`
      );
    }
  }

  if (!req.settings || typeof req.settings !== "object") {
    errors.push("settings is required and must be an object.");
  }

  return { valid: errors.length === 0, errors };
}

/** Validate a generated agent config */
export function validateAgentConfig(config: OpenClawAgentConfig): ValidationResult {
  const errors: string[] = [];

  if (!config.agentId) errors.push("agentId is required.");
  if (!config.customerId) errors.push("customerId is required.");
  if (!config.template) errors.push("template is required.");
  if (!config.name) errors.push("name is required.");
  if (!config.systemPrompt) errors.push("systemPrompt is required.");
  if (!config.model) errors.push("model is required.");
  if (!Array.isArray(config.tools)) errors.push("tools must be an array.");
  if (!Array.isArray(config.schedules)) errors.push("schedules must be an array.");

  return { valid: errors.length === 0, errors };
}
