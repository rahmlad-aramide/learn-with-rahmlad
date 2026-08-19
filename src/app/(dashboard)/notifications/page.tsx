"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Bell,
  BookOpen,
  CheckCircle,
  Newspaper,
  Trophy,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/button/Button";
import Spinner from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "achievement":
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case "progress":
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case "reminder":
      return <Bell className="h-5 w-5 text-purple-500" />;
    default:
      return <Newspaper className="h-5 w-5 text-gray-400" />;
  }
}

export default function NotificationsPage() {
  const { notifications, loading, markRead, deleteNotification } =
    useNotifications(50);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" variant="page" label="Loading notifications..." />
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Notifications" />
      <div className="mx-auto max-w-7xl pb-12">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-400">No notifications yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`p-6 transition-colors ${!n.is_read ? "border-orange-200 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/5" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">
                          {n.title}
                        </h3>
                        {n.message && (
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            {n.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(n.created_at).toLocaleDateString()} at{" "}
                          {new Date(n.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!n.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => markRead(n.id)}
                            className="text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => deleteNotification(n.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
