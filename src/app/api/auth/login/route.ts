import { NextRequest, NextResponse } from "next/server";
import { findCustomerByEmail } from "@/lib/customers";
import { createSessionToken, getSessionCookieName, type UserPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const customer = findCustomerByEmail(email);
    if (!customer || customer.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const payload: UserPayload = {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      company: customer.company,
      plan: customer.plan,
      agentStatus: customer.agentStatus,
      integrations: customer.integrations,
      onboarded: customer.onboarded,
    };

    const token = createSessionToken(payload);

    const response = NextResponse.json({
      success: true,
      user: payload,
    });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
