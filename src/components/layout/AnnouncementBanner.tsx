"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
}

interface Props {
  announcement: Announcement | null;
}

export function AnnouncementBanner({ announcement }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  const handleDismiss = async () => {
    setDismissed(true);
    await fetch(`/api/announcements/${announcement.id}/dismiss`, {
      method: "POST",
    }).catch(console.error);
  };

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-amber-800 dark:text-amber-300">
          {announcement.title}
        </p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
          {announcement.body}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="shrink-0 rounded-lg p-1 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-500/10"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
