import { NextRequest, NextResponse } from "next/server";
import { deleteAdminCustomer } from "@/lib/admin-data";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = deleteAdminCustomer(id);

  if (!ok) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
