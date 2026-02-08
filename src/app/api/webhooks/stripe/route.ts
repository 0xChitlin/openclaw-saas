import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { promises as fs } from "fs";
import path from "path";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_your_stripe_secret_key") return null;
  return new Stripe(key);
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
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
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customers = await readCustomers();

    const newCustomer: CustomerEntry = {
      id: session.id,
      email: session.customer_details?.email || "",
      name: session.customer_details?.name || undefined,
      tier: session.metadata?.tier || "unknown",
      stripeCustomerId:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id || undefined,
      stripeSubscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id || undefined,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    await writeCustomers(customers);

    console.log(
      `[Webhook] New customer: ${newCustomer.email} (${newCustomer.tier})`
    );

    // Also provision on the backend agent runtime
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    try {
      await fetch(`${backendUrl}/api/provision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newCustomer.email,
          name: newCustomer.name,
          plan: newCustomer.tier || "starter",
          stripe_id: newCustomer.stripeCustomerId,
          template: "email-manager",
        }),
      });
      console.log(`[Webhook] Backend provision called for ${newCustomer.email}`);
    } catch (err) {
      console.error("[Webhook] Failed to provision on backend:", err);
      // Don't fail the webhook — the customer is still created locally
    }
  }

  return NextResponse.json({ received: true });
}
