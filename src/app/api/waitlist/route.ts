import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "waitlist.json");

interface WaitlistEntry {
  email: string;
  useCase: string;
  businessType?: string;
  timestamp: string;
  ip?: string;
}

async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeWaitlist(entries: WaitlistEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, useCase, businessType } = body;

    // Validation
    if (!email || !useCase) {
      return NextResponse.json(
        { error: "Email and use case are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Read existing entries
    const entries = await readWaitlist();

    // Check for duplicates
    if (entries.some((e) => e.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { error: "You're already on the waitlist! We'll be in touch soon." },
        { status: 409 }
      );
    }

    // Add new entry
    const newEntry: WaitlistEntry = {
      email: email.toLowerCase().trim(),
      useCase,
      businessType: businessType?.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    entries.push(newEntry);
    await writeWaitlist(entries);

    console.log(`[Waitlist] New signup: ${email} — ${useCase}`);

    return NextResponse.json(
      {
        message: "Successfully joined the waitlist!",
        position: entries.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Waitlist] Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const entries = await readWaitlist();
    return NextResponse.json({
      total: entries.length,
      entries: entries.map((e) => ({
        email: e.email.replace(/(.{2}).*(@.*)/, "$1***$2"), // Mask email
        useCase: e.useCase,
        timestamp: e.timestamp,
      })),
    });
  } catch {
    return NextResponse.json({ total: 0, entries: [] });
  }
}
