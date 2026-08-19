import { createServerClientInstance } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createServerClientInstance();

  const [
    { count: studentCount },
    { count: pathCount },
    { count: courseCount },
    { count: pendingRequests },
    { count: certificatesIssued },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "user"),
    supabase
      .from("learning_paths")
      .select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase
      .from("session_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("certificates").select("id", { count: "exact", head: true }),
  ]);

  const metrics = [
    {
      label: "Students",
      value: studentCount ?? 0,
      href: "/admin/students",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      label: "Learning Paths",
      value: pathCount ?? 0,
      href: "/admin/content",
      color:
        "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    },
    {
      label: "Courses",
      value: courseCount ?? 0,
      href: "/admin/content",
      color:
        "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300",
    },
    {
      label: "Pending Requests",
      value: pendingRequests ?? 0,
      href: "/admin/sessions",
      color:
        "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
    },
    {
      label: "Certificates Issued",
      value: certificatesIssued ?? 0,
      href: "/admin/certificates",
      color:
        "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    },
  ];

  const quickLinks = [
    {
      label: "Manage Sessions",
      href: "/admin/sessions",
      desc: "Post group sessions, approve 1-on-1 requests",
    },
    {
      label: "Import Content",
      href: "/admin/content/import",
      desc: "Upload CSV to add courses and resources",
    },
    {
      label: "View Students",
      href: "/admin/students",
      desc: "See all students and their progress",
    },
    {
      label: "Certificate Templates",
      href: "/admin/certificates",
      desc: "Upload and manage certificate designs",
    },
    {
      label: "Announcements",
      href: "/admin/announcements",
      desc: "Publish feature updates to all users",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
        Admin Dashboard
      </h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className={`rounded-2xl p-5 transition-opacity hover:opacity-80 ${m.color}`}
          >
            <p className="text-3xl font-bold">{m.value}</p>
            <p className="mt-1 text-sm font-medium">{m.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <p className="font-semibold text-gray-800 dark:text-white/90">
                {l.label}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {l.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
