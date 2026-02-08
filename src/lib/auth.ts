import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "deskagents-dashboard-secret-key-2026";
const COOKIE_NAME = "da_session";

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  company: string;
  plan: string;
  agentStatus: string;
  integrations: string[];
  onboarded: boolean;
}

// Simple HMAC-based token (no external JWT dependency needed)
function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

function verify(token: string): UserPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64url");
    if (signature !== expected) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString()) as UserPayload;
  } catch {
    return null;
  }
}

export function createSessionToken(user: UserPayload): string {
  return sign({ ...user, iat: Date.now() });
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}
