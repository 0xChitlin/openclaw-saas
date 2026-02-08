import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCustomer } from "@/lib/customers";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, company } = await req.json();

    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (company) updates.company = company;

    const updated = updateCustomer(session.id, updates);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: { name: updated.name, email: updated.email, company: updated.company } });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
