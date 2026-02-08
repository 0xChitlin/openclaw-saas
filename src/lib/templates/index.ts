/**
 * Template Index
 *
 * Central registry of all agent templates with metadata,
 * lookup helpers, and re-exports.
 */

import type {
  TemplateName,
  TemplateMetadata,
  TemplateGenerator,
} from "@/lib/schemas/agent-config";

import {
  generateEmailManagerConfig,
  emailManagerMetadata,
} from "./email-manager";

import {
  generateSupportConfig,
  customerSupportMetadata,
} from "./customer-support";

import {
  generateKintoneConfig,
  kintoneAutomationMetadata,
} from "./kintone-automation";

// Re-export generators for convenience
export { generateEmailManagerConfig } from "./email-manager";
export { generateSupportConfig } from "./customer-support";
export { generateKintoneConfig } from "./kintone-automation";

// ---------------------------------------------------------------------------
// Template Registry
// ---------------------------------------------------------------------------

interface TemplateEntry {
  metadata: TemplateMetadata;
  generate: TemplateGenerator;
}

const templates: Record<TemplateName, TemplateEntry> = {
  "email-manager": {
    metadata: emailManagerMetadata,
    generate: generateEmailManagerConfig,
  },
  "customer-support": {
    metadata: customerSupportMetadata,
    generate: generateSupportConfig,
  },
  "kintone-automation": {
    metadata: kintoneAutomationMetadata,
    generate: generateKintoneConfig,
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** List all available templates with metadata */
export function listTemplates(): TemplateMetadata[] {
  return Object.values(templates).map((t) => t.metadata);
}

/** Get a specific template by name. Returns undefined if not found. */
export function getTemplate(name: string): TemplateEntry | undefined {
  return templates[name as TemplateName];
}

/** Get just the metadata for a template */
export function getTemplateMetadata(name: string): TemplateMetadata | undefined {
  return templates[name as TemplateName]?.metadata;
}

/** Check if a template name is valid */
export function isValidTemplate(name: string): name is TemplateName {
  return name in templates;
}

/** All template names */
export const templateNames: TemplateName[] = Object.keys(templates) as TemplateName[];
