import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCustomer, findCustomerById } from "@/lib/customers";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    let newStatus: string;
    switch (action) {
      case "pause":
        newStatus = "paused";
        break;
      case "resume":
        newStatus = "active";
        break;
      case "delete":
        newStatus = "deleted";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = updateCustomer(session.id, { agentStatus: newStatus });
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agentStatus: newStatus });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = findCustomerById(session.id);
    if (!customer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      agentStatus: customer.agentStatus,
      plan: customer.plan,
      integrations: customer.integrations,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
