import { NextResponse } from "next/server";
import { getAdminCustomers, getAdminAgents } from "@/lib/admin-data";

export async function GET() {
  const customers = getAdminCustomers();
  const agents = getAdminAgents();

  // Enrich with agent count
  const enriched = customers.map((c) => ({
    ...c,
    agentCount: agents.filter((a) => a.customer_id === c.id).length,
  }));

  return NextResponse.json({ customers: enriched });
}
