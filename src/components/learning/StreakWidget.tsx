"use client";
import { Flame } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

export function StreakWidget() {
  const { effectiveStreak, longestStreak, activeDays, loading } =
    useUserStats();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3 h-full">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/10">
        <Flame className="size-6 text-orange-500" />
      </div>

      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Learning Streak
        </span>
        <div className="mt-2 flex items-baseline gap-1">
          <h4 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
            {loading ? "..." : effectiveStreak}
          </h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">days</span>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          {days.map((d, i) => {
            const active = activeDays.has(d.toDateString());
            return (
              <div
                key={i}
                title={d.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                className={`h-5 w-5 rounded-sm transition-colors ${
                  loading
                    ? "animate-pulse bg-gray-200 dark:bg-gray-700"
                    : active
                      ? "bg-orange-400 dark:bg-orange-500"
                      : "bg-gray-100 dark:bg-gray-800"
                }`}
              />
            );
          })}
        </div>

        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Longest: {loading ? "—" : longestStreak} days
        </p>
      </div>
    </div>
  );
}
