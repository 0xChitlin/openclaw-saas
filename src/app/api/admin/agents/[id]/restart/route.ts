import { NextRequest, NextResponse } from "next/server";
import { updateAdminAgent, addAdminLog } from "@/lib/admin-data";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = updateAdminAgent(id, {
    status: "running",
    last_heartbeat: new Date().toISOString(),
  });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  addAdminLog(id, "info", "Agent restarted by admin");
  return NextResponse.json({ ok: true, agent });
}
