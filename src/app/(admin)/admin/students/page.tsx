import { createServerClientInstance } from "@/lib/supabase/server";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

export default async function StudentsPage() {
  const supabase = await createServerClientInstance();

  const { data: students } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, created_at")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  // Fetch progress counts for each student
  const progressData = await Promise.all(
    (students ?? []).map(async (s: Student) => {
      const [{ count: completed }, { count: certs }] = await Promise.all([
        supabase
          .from("user_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", s.id)
          .eq("completed", true),
        supabase
          .from("certificates")
          .select("id", { count: "exact", head: true })
          .eq("user_id", s.id),
      ]);
      return { id: s.id, completed: completed ?? 0, certs: certs ?? 0 };
    }),
  );

  const progressMap = Object.fromEntries(progressData.map((p) => [p.id, p]));

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white/90">
        Students
      </h1>

      {!students || students.length === 0 ? (
        <p className="text-gray-500">No students have signed up yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 dark:bg-white/5 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Resources Completed</th>
                <th className="px-4 py-3 font-medium">Certificates</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(students as Student[]).map((s) => {
                const p = progressMap[s.id];
                return (
                  <tr key={s.id} className="bg-white dark:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {s.email}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {p?.completed ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {p?.certs ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {fmt(s.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
