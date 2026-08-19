"use client";
import { useState, useMemo } from "react";
import {
  useGGProgress,
  GGCurriculumItem,
  GGProgress,
} from "@/hooks/useGGProgress";
import {
  ChevronDown,
  ChevronRight,
  Video,
  Dumbbell,
  HelpCircle,
  FolderGit2,
  BookOpen,
} from "lucide-react";
import * as Progress from "@radix-ui/react-progress";

export interface GGLeaderboardEntry {
  user_id: string;
  first_name: string;
  last_name: string;
  total_xp: number;
  completed_count: number;
  completion_pct: number;
}

interface Props {
  userId: string;
  firstName: string;
  curriculum: GGCurriculumItem[];
  initialProgress: GGProgress[];
  leaderboard: GGLeaderboardEntry[];
}

const PHASE_NAMES: Record<number, string> = {
  0: "Introduction & Fundamentals",
  1: "HTML, CSS & Tailwind",
  2: "JavaScript Foundations",
  3: "Hands-On JS Projects",
  4: "Backend Foundations",
  5: "Intermediate Backend",
  6: "Frontend with React",
  7: "Full-Stack with Next.js",
  8: "Advanced & AI Integration",
  9: "Deployment & DevOps",
};

function topicIcon(type: string) {
  switch (type) {
    case "video":
      return <Video size={14} className="text-blue-500" />;
    case "exercise":
      return <Dumbbell size={14} className="text-green-500" />;
    case "quiz":
      return <HelpCircle size={14} className="text-purple-500" />;
    case "project":
      return <FolderGit2 size={14} className="text-orange-500" />;
    default:
      return <BookOpen size={14} className="text-gray-400" />;
  }
}

function phaseStatusLabel(pct: number) {
  if (pct === 0)
    return {
      label: "Not Started",
      color: "text-gray-400 bg-gray-100 dark:bg-gray-800",
    };
  if (pct === 100)
    return {
      label: "Complete ✅",
      color: "text-green-700 bg-green-100 dark:bg-green-900/30",
    };
  return {
    label: "In Progress ⏳",
    color: "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30",
  };
}

function computeStreak(completedDates: (string | null)[]): number {
  const days = new Set(
    completedDates
      .filter((d): d is string => !!d)
      .map((d) => new Date(d).toDateString()),
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function projectedCompletion(
  total: number,
  completed: number,
  recentDates: (string | null)[],
): string | null {
  if (completed === total) return null;
  const last7 = recentDates
    .filter((d): d is string => !!d)
    .filter((d) => Date.now() - new Date(d).getTime() < 7 * 86400000);
  const uniqueDays = new Set(last7.map((d) => new Date(d).toDateString())).size;
  const perDay = uniqueDays > 0 ? last7.length / uniqueDays : 0;
  if (perDay === 0) return null;
  const daysLeft = Math.ceil((total - completed) / perDay);
  const date = new Date();
  date.setDate(date.getDate() + daysLeft);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function GoldenGenerationClient({
  userId,
  firstName,
  curriculum,
  initialProgress,
  leaderboard,
}: Props) {
  const [progressMap, setProgressMap] = useState<
    Map<string, { completed: boolean; completed_at: string | null }>
  >(() => {
    const m = new Map<
      string,
      { completed: boolean; completed_at: string | null }
    >();
    initialProgress.forEach((p) =>
      m.set(p.curriculum_id, {
        completed: p.completed,
        completed_at: p.completed_at,
      }),
    );
    return m;
  });
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    () => new Set([0]),
  );
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const { toggleItem, toggling } = useGGProgress(userId);

  const handleToggle = (id: string) => {
    const current = progressMap.get(id)?.completed ?? false;
    toggleItem(id, current, (cId, completed, completed_at) => {
      setProgressMap((prev) =>
        new Map(prev).set(cId, { completed, completed_at }),
      );
    });
  };

  const togglePhase = (phase: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });
  };

  const toggleWeek = (key: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Group curriculum into phase → week → items
  const grouped = useMemo(() => {
    const map = new Map<number, Map<number, GGCurriculumItem[]>>();
    for (const item of curriculum) {
      if (!map.has(item.phase)) map.set(item.phase, new Map());
      const phaseMap = map.get(item.phase)!;
      if (!phaseMap.has(item.week)) phaseMap.set(item.week, []);
      phaseMap.get(item.week)!.push(item);
    }
    return map;
  }, [curriculum]);

  const totalItems = curriculum.length;
  const completedItems = curriculum.filter(
    (c) => progressMap.get(c.id)?.completed,
  ).length;
  const overallPct =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const allCompletedDates = Array.from(progressMap.values()).map(
    (v) => v.completed_at,
  );
  const streak = computeStreak(allCompletedDates);
  const projected = projectedCompletion(
    totalItems,
    completedItems,
    allCompletedDates,
  );

  const phases = Array.from(grouped.keys()).sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 dark:border-yellow-500/20 dark:from-yellow-500/5 dark:to-amber-500/5">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          My Learning Progress
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Golden Generation Community · Web Development Course
        </p>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Hi {firstName} 👋 keep going!
        </p>

        {/* Overall progress */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Overall Progress
            </span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {overallPct}%
            </span>
          </div>
          <Progress.Root className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <Progress.Indicator
              className="h-full rounded-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </Progress.Root>
          <p className="mt-1 text-xs text-gray-400">
            {completedItems} of {totalItems} tasks complete
          </p>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-white/5">
            <p className="text-2xl font-bold text-yellow-600">{streak}</p>
            <p className="text-xs text-gray-500">Day streak 🔥</p>
          </div>
          <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-white/5">
            <p className="text-2xl font-bold text-green-600">
              {
                phases.filter((p) => {
                  const items = Array.from(grouped.get(p)!.values()).flat();
                  return (
                    items.length > 0 &&
                    items.every((c) => progressMap.get(c.id)?.completed)
                  );
                }).length
              }
            </p>
            <p className="text-xs text-gray-500">Phases done</p>
          </div>
          <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-white/5">
            <p className="text-sm font-semibold text-blue-600">
              {projected ?? "—"}
            </p>
            <p className="text-xs text-gray-500">Est. completion</p>
          </div>
        </div>
      </div>

      {/* Phase cards */}
      {curriculum.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-10 text-center text-gray-400 dark:border-gray-800">
          Curriculum coming soon — check back shortly.
        </div>
      ) : (
        phases.map((phase) => {
          const phaseWeeks = grouped.get(phase)!;
          const phaseItems = Array.from(phaseWeeks.values()).flat();
          const phaseDone = phaseItems.filter(
            (c) => progressMap.get(c.id)?.completed,
          ).length;
          const phasePct =
            phaseItems.length > 0
              ? Math.round((phaseDone / phaseItems.length) * 100)
              : 0;
          const { label, color } = phaseStatusLabel(phasePct);
          const isPhaseOpen = expandedPhases.has(phase);
          const weeks = Array.from(phaseWeeks.keys()).sort((a, b) => a - b);

          return (
            <div
              key={phase}
              className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
            >
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  {isPhaseOpen ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white/90">
                      Phase {phase}: {PHASE_NAMES[phase] ?? ""}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Progress.Root className="relative h-1.5 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <Progress.Indicator
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{ width: `${phasePct}%` }}
                        />
                      </Progress.Root>
                      <span className="text-xs text-gray-400">
                        {phaseDone}/{phaseItems.length}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
                >
                  {label}
                </span>
              </button>

              {/* Phase content */}
              {isPhaseOpen && (
                <div className="border-t border-gray-100 dark:border-gray-800">
                  {weeks.map((week) => {
                    const weekItems = phaseWeeks.get(week)!;
                    const weekDone = weekItems.filter(
                      (c) => progressMap.get(c.id)?.completed,
                    ).length;
                    const weekKey = `${phase}-${week}`;
                    const isWeekOpen = expandedWeeks.has(weekKey);

                    return (
                      <div
                        key={week}
                        className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                      >
                        {/* Week header */}
                        <button
                          onClick={() => toggleWeek(weekKey)}
                          className="flex w-full items-center justify-between px-6 py-3 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                        >
                          <div className="flex items-center gap-2">
                            {isWeekOpen ? (
                              <ChevronDown
                                size={14}
                                className="text-gray-400"
                              />
                            ) : (
                              <ChevronRight
                                size={14}
                                className="text-gray-400"
                              />
                            )}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Week {week}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({weekDone}/{weekItems.length})
                            </span>
                          </div>
                          {weekDone === weekItems.length &&
                            weekItems.length > 0 && (
                              <span className="text-xs text-green-500">
                                Complete ✅
                              </span>
                            )}
                        </button>

                        {/* Task items */}
                        {isWeekOpen && (
                          <ul className="divide-y divide-gray-50 pb-2 dark:divide-gray-800">
                            {weekItems.map((item) => {
                              const state = progressMap.get(item.id);
                              const done = state?.completed ?? false;
                              const isToggling = toggling.has(item.id);

                              return (
                                <li
                                  key={item.id}
                                  className="flex cursor-pointer items-center gap-3 px-8 py-2.5 transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                  onClick={() =>
                                    !isToggling && handleToggle(item.id)
                                  }
                                >
                                  <div
                                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                                      done
                                        ? "border-green-500 bg-green-500"
                                        : "border-gray-300 bg-white dark:border-gray-600 dark:bg-transparent"
                                    } ${isToggling ? "opacity-50" : ""}`}
                                  >
                                    {done && (
                                      <svg
                                        className="h-3 w-3 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="mr-1 flex-shrink-0">
                                    {topicIcon(item.topic_type)}
                                  </span>
                                  <span
                                    className={`flex-1 text-sm ${done ? "text-gray-400 line-through dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}`}
                                  >
                                    {item.title}
                                  </span>
                                  {item.estimated_minutes && (
                                    <span className="flex-shrink-0 text-xs text-gray-400">
                                      {item.estimated_minutes >= 60
                                        ? `${Math.round(item.estimated_minutes / 60)}h`
                                        : `${item.estimated_minutes}m`}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* GG Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 dark:border-yellow-500/20 dark:from-yellow-500/5 dark:to-amber-500/5">
          <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">
            🏆 GG Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-yellow-200 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase dark:border-yellow-500/20 dark:text-gray-400">
                  <th className="pr-4 pb-2">#</th>
                  <th className="pr-4 pb-2">Name</th>
                  <th className="pr-4 pb-2">Tasks</th>
                  <th className="pr-4 pb-2">Progress</th>
                  <th className="pb-2">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yellow-100 dark:divide-yellow-500/10">
                {leaderboard.map((entry, i) => {
                  const isMe = entry.user_id === userId;
                  return (
                    <tr
                      key={entry.user_id}
                      className={`${isMe ? "font-semibold text-yellow-700 dark:text-yellow-400" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      <td className="py-2.5 pr-4 text-gray-400">
                        {i + 1 === 1
                          ? "🥇"
                          : i + 1 === 2
                            ? "🥈"
                            : i + 1 === 3
                              ? "🥉"
                              : i + 1}
                      </td>
                      <td className="py-2.5 pr-4">
                        {entry.first_name} {entry.last_name}
                        {isMe && (
                          <span className="ml-1.5 text-xs text-yellow-500">
                            (you)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">{entry.completed_count}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-yellow-200 dark:bg-yellow-900/40">
                            <div
                              className="h-full rounded-full bg-yellow-400"
                              style={{ width: `${entry.completion_pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">
                            {entry.completion_pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-purple-600 dark:text-purple-400">
                        {entry.total_xp.toLocaleString()} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
