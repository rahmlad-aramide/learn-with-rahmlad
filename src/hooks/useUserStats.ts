"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "./useCurrentProfile";
import { getLevelFromXP, type LevelInfo } from "@/lib/gamification";

export interface RecentBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badges: {
    name: string;
    icon: string;
    description: string;
  };
}

export function useUserStats() {
  const { profile, loading: profileLoading, refresh } = useCurrentProfile();

  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [recentBadges, setRecentBadges] = useState<RecentBadge[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      if (!profileLoading) setStatsLoading(false);
      return;
    }

    const supabase = createClient();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    Promise.all([
      supabase
        .from("user_progress")
        .select("completed_at")
        .eq("user_id", profile.id)
        .eq("completed", true)
        .gte("completed_at", sevenDaysAgo),
      supabase
        .from("user_badges")
        .select("id, badge_id, earned_at, badges(name, icon, description)")
        .eq("user_id", profile.id)
        .order("earned_at", { ascending: false })
        .limit(3),
    ]).then(([{ data: days }, { data: badges }]) => {
      setActiveDays(
        new Set(
          (days ?? [])
            .filter((d: { completed_at: string | null }) => d.completed_at)
            .map((d: { completed_at: string | null }) =>
              new Date(d.completed_at!).toDateString(),
            ),
        ),
      );
      setRecentBadges((badges as unknown as RecentBadge[]) ?? []);
      setStatsLoading(false);
    });
  }, [profile, profileLoading]);

  const effectiveStreak = (() => {
    if (!profile?.last_active_date) return 0;
    const lastActive = new Date(profile.last_active_date + "T00:00:00Z");
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);
    return lastActive >= yesterday ? profile.current_streak : 0;
  })();

  const levelInfo: LevelInfo = getLevelFromXP(profile?.total_xp ?? 0);

  return {
    loading: profileLoading || statsLoading,
    profile,
    refresh,
    xp: profile?.total_xp ?? 0,
    effectiveStreak,
    longestStreak: profile?.longest_streak ?? 0,
    activeDays,
    levelInfo,
    recentBadges,
  };
}
