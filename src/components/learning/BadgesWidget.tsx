"use client";
import Link from "next/link";
import { Medal } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function BadgesWidget() {
  const { recentBadges, loading } = useUserStats();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-500/10">
        <Medal className="size-6 text-yellow-500" />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Recent Badges
          </span>
          <Link
            href="/profile"
            className="text-brand-500 text-xs hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-3 space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))
          ) : recentBadges.length === 0 ? (
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Complete resources to earn your first badge
            </p>
          ) : (
            recentBadges.map((ub) => (
              <div
                key={ub.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{ub.badges.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ub.badges.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(ub.earned_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
