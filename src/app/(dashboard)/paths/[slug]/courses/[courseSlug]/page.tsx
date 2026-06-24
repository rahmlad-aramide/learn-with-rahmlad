"use client";

import {
  ArrowLeft,
  BookOpen,
  Clock,
  Bookmark,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "@/components/ui/button/Button";
import DynamicPageBreadcrumb from "@/components/common/DynamicBreadCrumb";

interface Resource {
  id: string;
  title: string;
  type: "video" | "article" | "interactive";
  url?: string;
  video_embed_url?: string;
  estimated_minutes?: number;
  order_index: number;
}

interface Course {
  id: string;
  title: string;
  learning_path_id: string;
}

export default function CoursePage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const pathSlug = params.slug as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [completedResources, setCompletedResources] = useState<Set<string>>(
    new Set(),
  );
  const [bookmarkedResources, setBookmarkedResources] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCourseAndResources();
  }, [courseSlug]);

  const fetchCourseAndResources = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", courseSlug)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      if (courseData) {
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("resources")
          .select("*")
          .eq("course_id", courseData.id)
          .order("order_index");

        if (resourcesError) throw resourcesError;
        setResources(resourcesData || []);
        if (resourcesData?.length > 0) {
          setSelectedResource(resourcesData[0]);
        }

        // Fetch user progress and bookmarks
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: progressData } = await supabase
            .from("user_progress")
            .select("resource_id")
            .eq("user_id", user.id)
            .eq("completed", true)
            .in("resource_id", resourcesData?.map((r: any) => r.id) || []);

          if (progressData) {
            setCompletedResources(
              new Set(progressData.map((p: any) => p.resource_id)),
            );
          }

          const { data: bookmarkData } = await supabase
            .from("user_bookmarks")
            .select("resource_id")
            .eq("user_id", user.id)
            .in("resource_id", resourcesData?.map((r: any) => r.id) || []);

          if (bookmarkData) {
            setBookmarkedResources(
              new Set(bookmarkData.map((b: any) => b.resource_id)),
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceComplete = async (resourceId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const isCompleted = completedResources.has(resourceId);

      if (isCompleted) {
        await supabase
          .from("user_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId);

        setCompletedResources((prev) => {
          const newSet = new Set(prev);
          newSet.delete(resourceId);
          return newSet;
        });
      } else {
        const { error } = await supabase.from("user_progress").upsert({
          user_id: user.id,
          resource_id: resourceId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

        if (!error) {
          setCompletedResources((prev) => new Set([...prev, resourceId]));
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleBookmark = async (resourceId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const isBookmarked = bookmarkedResources.has(resourceId);

      if (isBookmarked) {
        await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId);

        setBookmarkedResources((prev) => {
          const newSet = new Set(prev);
          newSet.delete(resourceId);
          return newSet;
        });
      } else {
        const { error } = await supabase.from("user_bookmarks").insert({
          user_id: user.id,
          resource_id: resourceId,
        });

        if (!error) {
          setBookmarkedResources((prev) => new Set([...prev, resourceId]));
        }
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/3">
          <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
            <h1 className="text-title-md xl:text-title-2xl mb-8 font-bold text-gray-800 dark:text-white/90">
              ERROR
            </h1>

            <Image
              src="/images/error/404.svg"
              alt="404"
              className="dark:hidden"
              width={472}
              height={152}
            />
            <Image
              src="/images/error/404-dark.svg"
              alt="404"
              className="hidden dark:block"
              width={472}
              height={152}
            />

            <p className="mt-10 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
              We can't seem to find the course you are looking for!
            </p>

            <Link
              href="/browse"
              className="shadow-theme-xs inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <DynamicPageBreadcrumb pageTitle="Course Page" />
      <div className="mx-auto max-w-7xl pb-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedResource && (
              <div className="space-y-6">
                <div>
                  <h1 className="mb-2 text-3xl font-bold">
                    {selectedResource.title}
                  </h1>
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <span className="capitalize">{selectedResource.type}</span>
                    {selectedResource.estimated_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedResource.estimated_minutes} mins
                      </span>
                    )}
                  </div>
                </div>

                {/* Resource Content */}
                <Card className="overflow-hidden p-6">
                  {selectedResource.video_embed_url ? (
                    <div className="bg-muted aspect-video overflow-hidden rounded-lg">
                      <iframe
                        src={selectedResource.video_embed_url}
                        title={selectedResource.title}
                        className="h-full w-full"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  ) : selectedResource.url ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        This is an external resource. Click the button below to
                        access it.
                      </p>
                      <a
                        href={selectedResource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="gap-2">
                          Open Resource <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No content available yet
                    </p>
                  )}
                </Card>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={
                      completedResources.has(selectedResource.id)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleResourceComplete(selectedResource.id)}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {completedResources.has(selectedResource.id)
                      ? "Completed"
                      : "Mark as Complete"}
                  </Button>
                  <Button
                    variant={
                      bookmarkedResources.has(selectedResource.id)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleBookmark(selectedResource.id)}
                    className="gap-2"
                  >
                    <Bookmark className="h-4 w-4" />
                    {bookmarkedResources.has(selectedResource.id)
                      ? "Bookmarked"
                      : "Bookmark"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Resources List */}
          <div>
            <Card>
              <div className="border-border border-b p-6">
                <h2 className="text-lg font-bold">{course.title}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {resources.length} resources
                </p>
              </div>
              <div className="divide-border max-h-[600px] divide-y overflow-y-auto">
                {resources.map((resource) => (
                  <button
                    key={resource.id}
                    onClick={() => setSelectedResource(resource)}
                    className={`w-full p-4 text-left transition-colors ${
                      selectedResource?.id === resource.id
                        ? "bg-primary/10 border-primary border-l-2"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={completedResources.has(resource.id)}
                        onChange={() => handleResourceComplete(resource.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`line-clamp-2 text-sm font-medium ${
                            completedResources.has(resource.id)
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {resource.title}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs capitalize">
                          {resource.type}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
