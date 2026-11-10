import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { APP_NAME } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || email.length > 200 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) {
    logger.error("RESEND_API_KEY or ADMIN_EMAIL is not configured");
    return NextResponse.json({ error: "Signups are temporarily unavailable." }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Beto Forge <onboarding@resend.dev>",
        to: adminEmail,
        subject: `${APP_NAME} — someone wants it back`,
        text: `${email} signed up to be notified if ${APP_NAME} is reactivated.`,
      }),
    });

    if (!res.ok) {
      logger.error("Paused-interest admin email failed", { status: res.status });
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch {
    logger.error("Paused-interest admin email threw");
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
  }
}
