import { createClient } from "@/lib/supabase/client";

export interface PathProgress {
  completedCourses: number;
  totalCourses: number;
  completedResources: number;
  totalResources: number;
  percentComplete: number;
}

export async function computePathProgress(
  userId: string,
  pathId: string,
): Promise<PathProgress> {
  const supabase = createClient();

  // Get all courses in this path (supports both old FK and junction table)
  const { data: courseLinks } = await supabase
    .from("course_paths")
    .select("course_id")
    .eq("learning_path_id", pathId);

  const courseIds: string[] = (courseLinks ?? []).map(
    (c: { course_id: string }) => c.course_id,
  );

  if (courseIds.length === 0) {
    return {
      completedCourses: 0,
      totalCourses: 0,
      completedResources: 0,
      totalResources: 0,
      percentComplete: 0,
    };
  }

  // Total resources across all courses in this path
  const { data: allResources } = await supabase
    .from("resources")
    .select("id, course_id")
    .in("course_id", courseIds);

  const totalResources = allResources?.length ?? 0;

  // Completed resources for this user
  const { data: completed } = await supabase
    .from("user_progress")
    .select("resource_id")
    .eq("user_id", userId)
    .eq("completed", true)
    .in(
      "resource_id",
      (allResources ?? []).map((r: { id: string; course_id: string }) => r.id),
    );

  const completedResourceIds = new Set(
    (completed ?? []).map((p: { resource_id: string }) => p.resource_id),
  );
  const completedResources = completedResourceIds.size;

  // Count completed courses (all resources in course are done)
  let completedCourses = 0;
  for (const courseId of courseIds) {
    type Res = { id: string; course_id: string };
    const courseResourceIds = (allResources ?? [])
      .filter((r: Res) => r.course_id === courseId)
      .map((r: Res) => r.id);
    if (
      courseResourceIds.length > 0 &&
      courseResourceIds.every((id: string) => completedResourceIds.has(id))
    ) {
      completedCourses++;
    }
  }

  return {
    completedCourses,
    totalCourses: courseIds.length,
    completedResources,
    totalResources,
    percentComplete:
      totalResources > 0
        ? Math.round((completedResources / totalResources) * 100)
        : 0,
  };
}
