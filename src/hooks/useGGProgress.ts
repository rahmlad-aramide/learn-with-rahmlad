"use client";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface GGCurriculumItem {
  id: string;
  phase: number;
  week: number;
  day: number | null;
  title: string;
  description: string | null;
  topic_type: string;
  order_index: number;
  estimated_minutes: number | null;
}

export interface GGProgress {
  curriculum_id: string;
  completed: boolean;
  completed_at: string | null;
}

export function useGGProgress(userId: string) {
  const [toggling, setToggling] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const toggleItem = useCallback(
    async (
      curriculumId: string,
      currentlyCompleted: boolean,
      onOptimisticUpdate: (
        id: string,
        completed: boolean,
        completedAt: string | null,
      ) => void,
    ) => {
      if (toggling.has(curriculumId)) return;
      setToggling((s) => new Set(s).add(curriculumId));

      const nowCompleted = !currentlyCompleted;
      const completedAt = nowCompleted ? new Date().toISOString() : null;

      // Optimistic update
      onOptimisticUpdate(curriculumId, nowCompleted, completedAt);

      const { error } = await supabase.from("gg_progress").upsert(
        {
          user_id: userId,
          curriculum_id: curriculumId,
          completed: nowCompleted,
          completed_at: completedAt,
        },
        { onConflict: "user_id,curriculum_id" },
      );

      if (error) {
        // Revert on failure
        onOptimisticUpdate(curriculumId, currentlyCompleted, null);
        console.error("Failed to save progress:", error);
      }

      setToggling((s) => {
        const next = new Set(s);
        next.delete(curriculumId);
        return next;
      });
    },
    [supabase, userId, toggling],
  );

  return { toggleItem, toggling };
}
