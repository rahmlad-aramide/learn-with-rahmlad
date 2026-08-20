"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface AppNotification {
  id: string;
  title: string;
  message: string | null;
  type: "progress" | "achievement" | "reminder" | "news";
  is_read: boolean;
  created_at: string;
}

export function useNotifications(limit = 20) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);
  const supabase = createClient();

  const fetchNotifications = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, type, is_read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      setNotifications(data ?? []);
      setLoading(false);
    },
    [supabase, limit],
  );

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      userIdRef.current = user.id;
      await fetchNotifications(user.id);

      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<AppNotification>) => {
            setNotifications((prev) =>
              [payload.new as AppNotification, ...prev].slice(0, limit),
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<AppNotification>) => {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === (payload.new as AppNotification).id
                  ? (payload.new as AppNotification)
                  : n,
              ),
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<AppNotification>) => {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== (payload.old as { id: string }).id),
            );
          },
        )
        .subscribe();
    };

    init();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications, limit]);

  const markRead = useCallback(
    async (id: string) => {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    },
    [supabase],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      await supabase.from("notifications").delete().eq("id", id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    },
    [supabase],
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, loading, unreadCount, markRead, deleteNotification };
}
