import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getResend } from "@/lib/email/resend";
import { renderEmailTemplate, EmailTemplate } from "@/lib/email/templates";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    to: string;
    template: EmailTemplate;
    data: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { to, template, data } = body;
  if (!to || !template || !data) {
    return NextResponse.json(
      { error: "Missing required fields: to, template, data" },
      { status: 400 },
    );
  }

  try {
    const { subject, html } = renderEmailTemplate(template, data as never);
    const resend = getResend();
    const result = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Learn With Rahmlad <noreply@learnwithrahmlad.com>",
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, id: result.data?.id });
  } catch (err) {
    console.error("[email/send]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 },
    );
  }
}
