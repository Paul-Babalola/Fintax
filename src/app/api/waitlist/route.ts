import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

// ── Your details ──────────────────────────────────────────────────────────────
// Update these before going live

const FROM_EMAIL = "Fintax <onboarding@resend.dev>"; // must match your verified Resend domain
const NOTIFY_EMAIL = "paulbabs2002@gmail.com"; // your email — get notified on each signup
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID; // optional — set if using Resend Audiences

export async function POST(request: NextRequest) {
  let body: { email?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    // ── 1. Add to Resend Audience (if configured) ────────────────────────
    if (AUDIENCE_ID) {
      await resend.contacts.create({
        email,
        audienceId: AUDIENCE_ID,
        unsubscribed: false,
      });
    }

    // ── 2. Send confirmation email to the signup ─────────────────────────
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're on the Fintax waitlist 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width">
        </head>
        <body style="font-family: -apple-system, 'Segoe UI', sans-serif; background: #F8FAF9; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #E5EDE9;">

            <!-- Header -->
            <div style="background: #1A6B4A; padding: 32px 36px;">
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #fff; letter-spacing: -0.3px;">
                Fin<span style="opacity: 0.8;">tax</span>
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 36px;">
              <h1 style="margin: 0 0 14px; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">
                You're on the list! 🎉
              </h1>
              <p style="margin: 0 0 20px; font-size: 15px; color: #6B7280; line-height: 1.7;">
                Thanks for joining the Fintax waitlist. We're building the first personal
                tax management app for Nigeria — designed around NTA 2025 so you always
                know your exact tax position.
              </p>

              <!-- What to expect -->
              <div style="background: #E6F4ED; border-radius: 10px; padding: 20px 22px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #1A6B4A; text-transform: uppercase; letter-spacing: 0.06em;">
                  What you get as an early member
                </p>
                ${[
                  "First access when we launch",
                  "3 months of Premium free",
                  "Shape the product with your feedback",
                ]
                  .map(
                    (item) => `
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="color: #1A6B4A; font-weight: 700; font-size: 14px;">✓</span>
                    <span style="font-size: 14px; color: #374151;">${item}</span>
                  </div>`,
                  )
                  .join("")}
              </div>

              <p style="margin: 0 0 24px; font-size: 14px; color: #6B7280; line-height: 1.7;">
                While you wait, you can start using Fintax right now — it's free.
              </p>

              <a href="https://fintax.app/signup"
                 style="display: inline-block; background: #1A6B4A; color: #fff;
                        font-size: 15px; font-weight: 600; padding: 14px 28px;
                        border-radius: 10px; text-decoration: none;">
                Create your free account →
              </a>
            </div>

            <!-- Footer -->
            <div style="padding: 20px 36px; border-top: 1px solid #E5EDE9;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.6;">
                You're receiving this because you signed up at fintax.app.
                <a href="" style="color: #6B7280;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // ── 3. Notify yourself of new signup ─────────────────────────────────
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `New Fintax waitlist signup: ${email}`,
      html: `<p>New waitlist signup: <strong>${email}</strong></p><p>Time: ${new Date().toISOString()}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Resend error:", err);

    // Resend throws on duplicate contacts — treat as success
    const message = err instanceof Error ? err.message : "";
    if (message.includes("already") || message.includes("duplicate")) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Could not add you to the waitlist. Please try again." },
      { status: 500 },
    );
  }
}
