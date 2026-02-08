import { NextRequest, NextResponse } from "next/server";
import { getAdminLogs } from "@/lib/admin-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const typeFilter = url.searchParams.get("type") || undefined;

  let logs = getAdminLogs(id, limit);

  if (typeFilter) {
    logs = logs.filter((l) => l.type === typeFilter);
  }

  return NextResponse.json({ logs });
}
