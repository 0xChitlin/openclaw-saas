import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  validateProvisionRequest,
  validateAgentConfig,
} from "@/lib/schemas/agent-config";
import type {
  TemplateName,
  ProvisionResponse,
  CustomerSettings,
} from "@/lib/schemas/agent-config";
import { getTemplate } from "@/lib/templates";

const AGENTS_DIR = path.join(process.cwd(), "data", "agents");

/**
 * POST /api/provision
 *
 * Provision a new AI agent from a template.
 *
 * Body: { customerId: string, template: TemplateName, settings: CustomerSettings }
 * Returns: { success, agentId, config } or { success: false, error }
 */
export async function POST(request: NextRequest): Promise<NextResponse<ProvisionResponse>> {
  try {
    const body: unknown = await request.json();

    // 1. Validate request shape
    const reqValidation = validateProvisionRequest(body);
    if (!reqValidation.valid) {
      return NextResponse.json(
        { success: false, error: reqValidation.errors.join(" ") },
        { status: 400 }
      );
    }

    const { customerId, template, settings } = body as {
      customerId: string;
      template: TemplateName;
      settings: CustomerSettings;
    };

    // 2. Look up template
    const tpl = getTemplate(template);
    if (!tpl) {
      return NextResponse.json(
        { success: false, error: `Template "${template}" not found.` },
        { status: 404 }
      );
    }

    // 3. Generate config
    const config = tpl.generate(customerId, settings);

    // 4. Validate generated config
    const configValidation = validateAgentConfig(config);
    if (!configValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: `Config validation failed: ${configValidation.errors.join(" ")}`,
        },
        { status: 500 }
      );
    }

    // 5. Persist to data/agents/{customerId}.json
    await fs.mkdir(AGENTS_DIR, { recursive: true });
    const filePath = path.join(AGENTS_DIR, `${customerId}.json`);

    // Support multiple agents per customer — store as array
    let existingAgents: unknown[] = [];
    try {
      const existing = await fs.readFile(filePath, "utf-8");
      const parsed: unknown = JSON.parse(existing);
      existingAgents = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // File doesn't exist yet — that's fine
    }

    existingAgents.push(config);
    await fs.writeFile(filePath, JSON.stringify(existingAgents, null, 2));

    console.log(
      `[Provision] Agent ${config.agentId} provisioned for customer ${customerId} (template: ${template})`
    );

    return NextResponse.json(
      {
        success: true,
        agentId: config.agentId,
        config,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Provision] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
