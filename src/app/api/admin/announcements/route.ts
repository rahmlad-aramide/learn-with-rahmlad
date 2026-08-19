import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const supabase = await createServerClientInstance();
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

  let body: { title: string; body: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, body: bodyText } = body;
  if (!title?.trim() || !bodyText?.trim()) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 },
    );
  }

  // Insert announcement using anon client (RLS allows admins)
  const { data: announcement, error: insertError } = await supabase
    .from("announcements")
    .insert({ title: title.trim(), body: bodyText.trim(), created_by: user.id })
    .select("id")
    .single();

  if (insertError || !announcement) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create announcement" },
      { status: 500 },
    );
  }

  // Bulk-notify all users via service client (bypasses RLS)
  const serviceClient = createServiceClient();
  const { data: allUsers } = await serviceClient
    .from("profiles")
    .select("id")
    .neq("id", user.id);

  if (allUsers && allUsers.length > 0) {
    const notifications = allUsers.map((u: { id: string }) => ({
      user_id: u.id,
      title: `📢 ${title.trim()}`,
      message: bodyText.trim(),
      type: "news" as const,
    }));

    const { error: notifyError } = await serviceClient
      .from("notifications")
      .insert(notifications);

    if (notifyError) {
      console.error("[announcements] bulk notify failed:", notifyError);
    }
  }

  return NextResponse.json({ id: announcement.id });
}
