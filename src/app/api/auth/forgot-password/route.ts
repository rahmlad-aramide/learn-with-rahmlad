import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getResend } from "@/lib/email/resend";
import { renderEmailTemplate } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  let body: { email: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email } = body;
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://learn.rahmlad.com";

  try {
    const supabase = createServiceClient();

    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${APP_URL}/auth/callback?next=/update-password`,
        },
      });

    if (linkError) {
      console.error("[forgot-password] generateLink error:", linkError);
      // Return success to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    const profile = linkData?.user;
    const firstName = (profile?.user_metadata?.first_name as string) || "there";

    const { subject, html } = renderEmailTemplate("forgot_password", {
      firstName,
      resetLink: linkData?.properties?.action_link ?? "",
    });

    const resend = getResend();
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Learn With Rahmlad <noreply@learnwithrahmlad.com>",
      to: email,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  }
}
