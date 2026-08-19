import { createServerClientInstance } from "@/lib/supabase/server";
import Link from "next/link";

interface LearningPath {
  id: string;
  title: string;
  slug: string;
  difficulty_level: string | null;
  created_at: string;
  course_count: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  created_at: string;
  resource_count: number;
}

export default async function AdminContentPage() {
  const supabase = await createServerClientInstance();

  const [{ data: rawPaths }, { data: rawCourses }] = await Promise.all([
    supabase
      .from("learning_paths")
      .select("id, title, slug, difficulty_level, created_at")
      .order("title"),
    supabase
      .from("courses")
      .select("id, title, slug, order_index, created_at")
      .order("order_index"),
  ]);

  // Count courses per path via course_paths
  const pathIds = (rawPaths ?? []).map((p) => p.id);
  const { data: courseCounts } = await supabase
    .from("course_paths")
    .select("learning_path_id")
    .in("learning_path_id", pathIds);

  const courseCountMap: Record<string, number> = {};
  for (const row of courseCounts ?? []) {
    courseCountMap[row.learning_path_id] =
      (courseCountMap[row.learning_path_id] ?? 0) + 1;
  }

  // Count resources per course
  const courseIds = (rawCourses ?? []).map((c) => c.id);
  const { data: resourceCounts } = await supabase
    .from("resources")
    .select("course_id")
    .in("course_id", courseIds);

  const resourceCountMap: Record<string, number> = {};
  for (const row of resourceCounts ?? []) {
    resourceCountMap[row.course_id] =
      (resourceCountMap[row.course_id] ?? 0) + 1;
  }

  const paths: LearningPath[] = (rawPaths ?? []).map((p) => ({
    ...p,
    course_count: courseCountMap[p.id] ?? 0,
  }));

  const courses: Course[] = (rawCourses ?? []).map((c) => ({
    ...c,
    resource_count: resourceCountMap[c.id] ?? 0,
  }));

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Content
        </h1>
        <Link
          href="/admin/content/import"
          className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          + Import CSV
        </Link>
      </div>

      {/* Learning Paths */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Learning Paths ({paths.length})
        </h2>
        {paths.length === 0 ? (
          <p className="text-sm text-gray-500">
            No learning paths yet. Import a CSV to get started.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                  <th className="px-4 py-3 font-medium">Courses</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paths.map((p) => (
                  <tr key={p.id} className="bg-white dark:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {p.title}
                      </p>
                      <p className="text-xs text-gray-400">{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {p.difficulty_level ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {p.course_count}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {fmt(p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Courses */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Courses ({courses.length})
        </h2>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">No courses yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Resources</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {courses.map((c) => (
                  <tr key={c.id} className="bg-white dark:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-400">{c.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {c.order_index}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {c.resource_count}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {fmt(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
