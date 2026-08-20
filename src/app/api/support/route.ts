import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getResend } from "@/lib/email/resend";
import { renderEmailTemplate } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: string; email: string; subject: string; message: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, subject, message } = body;
  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  try {
    const { subject: emailSubject, html } = renderEmailTemplate(
      "support_ticket",
      { name, email, subject, message },
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
    console.error("[support]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 500 },
    );
  }
}
