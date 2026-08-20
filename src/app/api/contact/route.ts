import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/email/resend";
import { renderEmailTemplate } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  let body: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required" },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  try {
    const { subject: emailSubject, html } = renderEmailTemplate(
      "contact_inquiry",
      { name, email, subject: body.subject, message },
    );

    const resend = getResend();
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Learn With Rahmlad <noreply@learnwithrahmlad.com>",
      to: "rahmladsolutions@gmail.com",
      replyTo: email,
      subject: emailSubject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 500 },
    );
  }
}
