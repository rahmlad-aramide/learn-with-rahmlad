"use client";
import { useState } from "react";

export function AnnouncementForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to publish");
      }

      setStatus("success");
      setTitle("");
      setBody("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        New Announcement
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="ann-title"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            id="ann-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's new?"
            required
            className="focus:border-brand-500 focus:ring-brand-500/20 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>

        <div>
          <label
            htmlFor="ann-body"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Message
          </label>
          <textarea
            id="ann-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Describe the update..."
            required
            className="focus:border-brand-500 focus:ring-brand-500/20 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-500">{errorMsg}</p>
      )}

      {status === "success" && (
        <p className="mt-3 text-sm text-green-600 dark:text-green-400">
          Announcement published to all users.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || !title.trim() || !body.trim()}
        className="bg-brand-500 mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Publishing..." : "Publish Announcement"}
      </button>
    </form>
  );
}
