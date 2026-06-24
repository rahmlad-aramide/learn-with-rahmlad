"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, BookOpen, Trash2 } from "lucide-react";

interface BookmarkedResource {
  id: string;
  resource_id: string;
  created_at: string;
  resources?: {
    id: string;
    title: string;
    type: string;
    courses?: {
      id: string;
      title: string;
      learning_paths?: {
        id: string;
        title: string;
      };
    };
  };
}

export default function BlankPage() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkedResource[]>([]);
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
    await fetchBookmarks(authUser.id);
  };

  const fetchBookmarks = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_bookmarks")
        .select(
          `
          id,
          resource_id,
          created_at,
          resources(
            id,
            title,
            type,
            courses(
              id,
              title,
              learning_paths(
                id,
                title
              )
            )
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      await supabase.from("user_bookmarks").delete().eq("id", bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <div>
      <PageBreadcrumb pageTitle="My Bookmarks" />
      <div className="mx-auto max-w-7xl pb-12">
        {bookmarks.length === 0 ? (
          <Card className="p-12 text-center">
            <Bookmark className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-4">
              No bookmarked resources yet
            </p>
            <Link href="/browse">
              <Button>Browse Resources</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <Card
                key={bookmark.id}
                className="p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <BookOpen className="text-primary h-4 w-4" />
                      <span className="text-primary text-xs font-medium uppercase">
                        {bookmark.resources?.type || "Resource"}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-bold">
                      {bookmark.resources?.title || "Untitled Resource"}
                    </h3>
                    <div className="text-muted-foreground space-y-1 text-sm">
                      {bookmark.resources?.courses && (
                        <p>
                          Course:{" "}
                          <span className="font-medium">
                            {bookmark.resources.courses.title}
                          </span>
                        </p>
                      )}
                      {bookmark.resources?.courses?.learning_paths && (
                        <p>
                          Path:{" "}
                          <span className="font-medium">
                            {bookmark.resources.courses.learning_paths.title}
                          </span>
                        </p>
                      )}
                      <p>
                        Saved:{" "}
                        <span className="font-medium">
                          {new Date(bookmark.created_at).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="hover:bg-destructive/10 text-destructive rounded-lg p-2 transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
