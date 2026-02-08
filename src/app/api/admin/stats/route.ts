import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin-data";

export async function GET() {
  const stats = getAdminStats();
  return NextResponse.json(stats);
}
