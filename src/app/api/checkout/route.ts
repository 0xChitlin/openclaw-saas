import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const TIERS: Record<string, { name: string; priceInCents: number }> = {
  individual: {
    name: "DeskAgent Individual",
    priceInCents: 4900,
  },
  business: {
    name: "DeskAgent Business",
    priceInCents: 19900,
  },
  enterprise: {
    name: "DeskAgent Enterprise",
    priceInCents: 99900,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier } = body;

    if (!tier || !TIERS[tier]) {
      return NextResponse.json(
        { error: "Invalid pricing tier." },
        { status: 400 }
      );
    }

    const { name, priceInCents } = TIERS[tier];

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name,
              description: `${name} — Monthly Subscription`,
            },
            unit_amount: priceInCents,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: {
        tier,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
