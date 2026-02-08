import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const CUSTOMERS_FILE = path.join(process.cwd(), "data", "customers.json");

interface CustomerEntry {
  id: string;
  email: string;
  name?: string;
  tier?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: string;
  createdAt: string;
  onboarding?: {
    name?: string;
    email?: string;
    automationGoal?: string;
    submittedAt?: string;
  };
}

async function readCustomers(): Promise<CustomerEntry[]> {
  try {
    const data = await fs.readFile(CUSTOMERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeCustomers(entries: CustomerEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(CUSTOMERS_FILE), { recursive: true });
  await fs.writeFile(CUSTOMERS_FILE, JSON.stringify(entries, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, automationGoal, sessionId } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const customers = await readCustomers();

    // Try to find existing customer by session ID
    const existingIdx = customers.findIndex((c) => c.id === sessionId);

    if (existingIdx !== -1) {
      // Update existing customer with onboarding data
      customers[existingIdx].onboarding = {
        name,
        email,
        automationGoal,
        submittedAt: new Date().toISOString(),
      };
    } else {
      // Create new entry (webhook may not have fired yet)
      customers.push({
        id: sessionId || `onboarding_${Date.now()}`,
        email,
        name,
        status: "onboarding",
        createdAt: new Date().toISOString(),
        onboarding: {
          name,
          email,
          automationGoal,
          submittedAt: new Date().toISOString(),
        },
      });
    }

    await writeCustomers(customers);

    console.log(`[Onboarding] ${name} (${email}) — Goal: ${automationGoal}`);

    return NextResponse.json(
      { message: "Onboarding data saved successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Onboarding] Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
