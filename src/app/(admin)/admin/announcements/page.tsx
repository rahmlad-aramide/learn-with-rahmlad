import { createServerClientInstance } from "@/lib/supabase/server";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";

export default async function AnnouncementsAdminPage() {
  const supabase = await createServerClientInstance();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, body, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
        Announcements
      </h1>

      <AnnouncementForm />

      {/* History */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Recent Announcements
        </h2>
        {!announcements || announcements.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No announcements yet.
          </p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white/90">
                      {a.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {a.body}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {a.is_active ? "Active" : "Inactive"}
                    </span>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {new Date(a.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
