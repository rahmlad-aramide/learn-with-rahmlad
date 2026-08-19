"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Spinner from "@/components/ui/spinner";

interface Session {
  id: string;
  title: string;
  description: string | null;
  status: string;
  starts_at: string;
  ends_at: string;
  meeting_url: string | null;
  max_capacity: number | null;
}

interface SessionRequest {
  id: string;
  user_id: string;
  topic: string;
  preferred_at: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  profiles: { first_name: string; last_name: string; email: string } | null;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [approveModal, setApproveModal] = useState<SessionRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    meeting_url: "",
    max_capacity: "",
  });
  const [approveForm, setApproveForm] = useState({
    meeting_url: "",
    admin_notes: "",
  });

  const supabase = createClient();

  const fetchAll = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) setAdminId(user.id);

    const [{ data: sessionsData }, { data: requestsData }] = await Promise.all([
      supabase
        .from("sessions")
        .select("*")
        .order("starts_at", { ascending: false }),
      supabase
        .from("session_requests")
        .select("*, user_id, profiles(first_name, last_name, email)")
        .order("created_at", { ascending: false }),
    ]);

    setSessions(sessionsData ?? []);
    setRequests(requestsData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreateSession = async () => {
    if (!form.title || !form.starts_at || !form.ends_at) return;
    setSaving(true);
    await supabase.from("sessions").insert({
      title: form.title,
      description: form.description || null,
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      meeting_url: form.meeting_url || null,
      max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
      created_by: adminId,
      status: "scheduled",
    });
    setForm({
      title: "",
      description: "",
      starts_at: "",
      ends_at: "",
      meeting_url: "",
      max_capacity: "",
    });
    setShowCreateModal(false);
    setSaving(false);
    await fetchAll();
  };

  const handleCancelSession = async (sessionId: string) => {
    await supabase
      .from("sessions")
      .update({ status: "cancelled" })
      .eq("id", sessionId);
    await fetchAll();
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    setSaving(true);
    await supabase
      .from("session_requests")
      .update({
        status: "approved",
        meeting_url: approveForm.meeting_url || null,
        admin_notes: approveForm.admin_notes || null,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", approveModal.id);

    // Notify the student via in-app notification
    await supabase.from("notifications").insert({
      user_id: approveModal.user_id,
      title: "Session Request Approved",
      message: `Your 1-on-1 session request "${approveModal.topic}" has been approved!${approveForm.meeting_url ? " Check your sessions for the meeting link." : ""}`,
      type: "achievement",
    });

    // Send email notification
    if (approveModal.profiles?.email) {
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: approveModal.profiles.email,
          template: "session_approved",
          data: {
            firstName: approveModal.profiles.first_name,
            topic: approveModal.topic,
          },
        }),
      }).catch(console.error);
    }

    setApproveModal(null);
    setApproveForm({ meeting_url: "", admin_notes: "" });
    setSaving(false);
    await fetchAll();
  };

  const handleReject = async (request: SessionRequest) => {
    await supabase
      .from("session_requests")
      .update({
        status: "rejected",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id);
    await fetchAll();
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-700",
      cancelled: "bg-gray-100 text-gray-500",
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-600",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? ""}`}
      >
        {status}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" variant="page" label="Loading sessions..." />
      </div>
    );

  return (
    <div className="space-y-10">
      {/* Group Sessions */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Group Sessions
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2 text-sm font-medium text-white"
          >
            + Create Session
          </button>
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No sessions yet. Create one above.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Starts</th>
                  <th className="px-4 py-3 font-medium">Ends</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sessions.map((s) => (
                  <tr key={s.id} className="bg-white dark:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                      {s.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {fmt(s.starts_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {fmt(s.ends_at)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(s.status)}</td>
                    <td className="px-4 py-3">
                      {s.status === "scheduled" && (
                        <button
                          onClick={() => handleCancelSession(s.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 1-on-1 Requests */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
          1-on-1 Session Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No requests yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 dark:bg-white/5 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Preferred Time</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {requests.map((r) => (
                  <tr key={r.id} className="bg-white dark:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {r.profiles
                          ? `${r.profiles.first_name} ${r.profiles.last_name}`
                          : "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {r.profiles?.email}
                      </p>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-gray-700 dark:text-gray-300">
                      {r.topic}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {r.preferred_at ? fmt(r.preferred_at) : "Flexible"}
                    </td>
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3">
                      {r.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setApproveModal(r);
                              setApproveForm({
                                meeting_url: "",
                                admin_notes: "",
                              });
                            }}
                            className="text-xs text-green-600 hover:text-green-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(r)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Create Group Session
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Title *
                </label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Live Q&A — JavaScript Fundamentals"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Description
                </label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="What will be covered?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Start *
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.starts_at}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, starts_at: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    End *
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.ends_at}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ends_at: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Meeting URL
                </label>
                <input
                  className={inputClass}
                  value={form.meeting_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, meeting_url: e.target.value }))
                  }
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Max capacity (optional)
                </label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.max_capacity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, max_capacity: e.target.value }))
                  }
                  placeholder="Leave blank for unlimited"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={
                  saving || !form.title || !form.starts_at || !form.ends_at
                }
                className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Request Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
              Approve Request
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              Topic:{" "}
              <span className="font-medium text-gray-700">
                {approveModal.topic}
              </span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Meeting URL (optional)
                </label>
                <input
                  className={inputClass}
                  value={approveForm.meeting_url}
                  onChange={(e) =>
                    setApproveForm((f) => ({
                      ...f,
                      meeting_url: e.target.value,
                    }))
                  }
                  placeholder="https://meet.google.com/..."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Note to student (optional)
                </label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={approveForm.admin_notes}
                  onChange={(e) =>
                    setApproveForm((f) => ({
                      ...f,
                      admin_notes: e.target.value,
                    }))
                  }
                  placeholder="Any instructions or context..."
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setApproveModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={saving}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Approving..." : "Approve & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
