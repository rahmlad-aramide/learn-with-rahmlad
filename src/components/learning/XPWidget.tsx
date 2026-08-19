"use client";
import { Zap } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

export function XPWidget() {
  const { xp, levelInfo, loading } = useUserStats();

  const pct = Math.round(levelInfo.progressInLevel * 100);
  const xpToNext =
    levelInfo.xpForNextLevel !== null ? levelInfo.xpForNextLevel - xp : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/10">
        <Zap className="size-6 text-purple-500" />
      </div>

      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Experience Points
        </span>
        <div className="mt-2 flex items-baseline gap-2">
          <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
            {loading ? "..." : xp.toLocaleString()} XP
          </h4>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            Lv {loading ? "—" : levelInfo.level}
          </span>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-purple-500 transition-all duration-500"
            style={{ width: loading ? "0%" : `${pct}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {loading
            ? "Loading..."
            : xpToNext !== null
              ? `${xpToNext.toLocaleString()} XP to Level ${levelInfo.level + 1}`
              : "Max Level reached 🎉"}
        </p>
      </div>
    </div>
  );
}
