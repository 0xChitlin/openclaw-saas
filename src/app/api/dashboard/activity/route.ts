import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRecentActivity } from "@/lib/activity";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = getRecentActivity(session.id);
    return NextResponse.json({ activities });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
