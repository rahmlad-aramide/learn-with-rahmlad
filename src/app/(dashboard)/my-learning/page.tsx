import type { Metadata } from "next";
import { createServerClientInstance } from "@/lib/supabase/server";
import { LearningMetrics } from "@/components/learning/LearningMetrics";
import LearningTarget from "@/components/learning/LearningTarget";
import { MyLearning } from "@/components/learning/MyLearning";
import { StreakWidget } from "@/components/learning/StreakWidget";
import { XPWidget } from "@/components/learning/XPWidget";
import { BadgesWidget } from "@/components/learning/BadgesWidget";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";

export const metadata: Metadata = {
  title: "Dashboard | Learn with Rahmlad",
  description:
    "Learn with Rahmlad - Resources website powered by Rahmlad Solutions",
};

export default async function Dashboard() {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let announcement: { id: string; title: string; body: string } | null = null;

  if (user) {
    // Get IDs this user has already dismissed
    const { data: dismissals } = await supabase
      .from("announcement_dismissals")
      .select("announcement_id")
      .eq("user_id", user.id);

    const dismissedIds = (dismissals ?? []).map(
      (d: { announcement_id: string }) => d.announcement_id,
    );

    // Fetch latest active announcement not yet dismissed
    let query = supabase
      .from("announcements")
      .select("id, title, body")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (dismissedIds.length > 0) {
      query = query.not("id", "in", `(${dismissedIds.join(",")})`);
    }

    const { data } = await query.maybeSingle();
    announcement = data ?? null;
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Announcement banner (conditional) */}
      {announcement && (
        <div className="col-span-12">
          <AnnouncementBanner announcement={announcement} />
        </div>
      )}

      {/* Gamification strip */}
      <div className="col-span-12 xl:col-span-4">
        <StreakWidget />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <XPWidget />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <BadgesWidget />
      </div>

      {/* Existing metrics + learning target */}
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <LearningMetrics />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <LearningTarget />
      </div>

      {/* Continue learning */}
      <div className="col-span-12">
        <MyLearning />
      </div>
    </div>
  );
}
