"use client";
import { Award, BookMarked, TrendingUp, TrendingUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const LearningMetrics = () => {
  const [stats, setStats] = useState({
    completedResources: 0,
    bookmarks: 0,
    certificates: 0,
    pendingResources: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/signin");
          return;
        }

        // Fetch completed resources count
        const { count: completedCount } = await supabase
          .from("user_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("completed", true);

        // Fetch bookmarks count
        const { count: bookmarksCount } = await supabase
          .from("user_bookmarks")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Fetch certificates count
        const { count: certificatesCount } = await supabase
          .from("certificates")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Calculate pending resources based on user progress in progress
        const { count: pendingCount } = await supabase
          .from("user_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("completed", false);

        setStats({
          completedResources: completedCount || 0,
          bookmarks: bookmarksCount || 0,
          certificates: certificatesCount || 0,
          pendingResources: pendingCount || 0,
        });
      } catch (error) {
        console.error("Error fetching learning metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase, router]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
          <TrendingUp className="text-primary size-6" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Completed Resources
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800 dark:text-white/90">
              {loading ? "..." : stats.completedResources}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
          <TrendingUpDown className="text-primary size-6" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pending Resources
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800 dark:text-white/90">
              {loading ? "..." : stats.pendingResources}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
          <BookMarked className="text-primary size-6" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Bookmarks
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800 dark:text-white/90">
              {loading ? "..." : stats.bookmarks}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
          <Award className="text-primary size-6" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Certificates
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800 dark:text-white/90">
              {loading ? "..." : stats.certificates}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
