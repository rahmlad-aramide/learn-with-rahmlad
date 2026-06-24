"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Bell, BookOpen, CheckCircle, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card";

interface Notification {
  id: string;
  title: string;
  description?: string;
  type: "progress" | "achievement" | "reminder" | "news";
  is_read: boolean;
  created_at: string;
  related_path_id?: string;
}
export default function BlankPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) {
      router.push("/signin");
      return;
    }

    setUser(authUser);
    await fetchNotifications(authUser.id);
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev: any) =>
        prev.map((n: any) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase.from("notifications").delete().eq("id", notificationId);

      setNotifications((prev: any) =>
        prev.filter((n: any) => n.id !== notificationId),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "progress":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "reminder":
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="text-muted-foreground h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }
  return (
    <div>
      <PageBreadcrumb pageTitle="Notifications" />
      <div className="mx-auto max-w-7xl pb-12">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">No notifications yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-6 transition-colors ${!notification.is_read ? "bg-primary/5 border-primary/20" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-1 text-lg font-semibold">
                          {notification.title}
                        </h3>
                        {notification.description && (
                          <p className="text-muted-foreground mb-3 text-sm">
                            {notification.description}
                          </p>
                        )}
                        <p className="text-muted-foreground text-xs">
                          {new Date(
                            notification.created_at,
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            notification.created_at,
                          ).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          // size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-muted-foreground hover:text-destructive"
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
