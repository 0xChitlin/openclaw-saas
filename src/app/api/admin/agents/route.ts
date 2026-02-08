import { NextResponse } from "next/server";
import { getAdminAgents, getAdminCustomers } from "@/lib/admin-data";

export async function GET() {
  const agents = getAdminAgents();
  const customers = getAdminCustomers();

  // Enrich agents with customer info
  const enriched = agents.map((a) => {
    const customer = customers.find((c) => c.id === a.customer_id);
    return {
      ...a,
      customer_name: customer?.name || "Unknown",
      customer_email: customer?.email || "—",
    };
  });

  return NextResponse.json({ agents: enriched });
}
