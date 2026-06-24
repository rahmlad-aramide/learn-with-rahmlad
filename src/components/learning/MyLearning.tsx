"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface InProgressCourse {
  courseId: string;
  courseTitle: string;
  pathSlug: string;
  courseSlug: string;
  pathTitle: string;
  completedResources: number;
  totalResources: number;
  estimatedHours: number;
}

export function MyLearning() {
  const [user, setUser] = useState<any>(null);
  const [inProgressCourses, setInProgressCourses] = useState<
    InProgressCourse[]
  >([]);
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
    await fetchInProgressCourses(authUser.id);
  };

  const fetchInProgressCourses = async (userId: string) => {
    try {
      // Get all completed resources by the user
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("resource_id, completed")
        .eq("user_id", userId);

      if (!progressData || progressData.length === 0) {
        setLoading(false);
        return;
      }

      const completedResourceIds = progressData
        .filter((p: any) => p.completed)
        .map((p: any) => p.resource_id);

      // Get all resources with their course and path info
      const { data: resourcesData } = await supabase
        .from("resources")
        .select(
          `
          id,
          course_id,
          courses (
            id,
            title,
            slug,
            learning_path_id,
            learning_paths (
              id,
              title,
              slug
            )
          )
        `,
        )
        .in(
          "id",
          progressData.map((p: any) => p.resource_id),
        );

      if (!resourcesData) {
        setLoading(false);
        return;
      }

      // Group by course and calculate progress
      const courseMap = new Map<string, InProgressCourse>();

      for (const resource of resourcesData) {
        const courseData = (resource as any).courses;
        const pathData = courseData?.learning_paths;

        if (!courseData || !pathData) continue;

        const courseId = courseData.id;
        const existingCourse = courseMap.get(courseId);

        if (!existingCourse) {
          // Count total resources for this course
          const { count: totalCount } = await supabase
            .from("resources")
            .select("*", { count: "exact", head: true })
            .eq("course_id", courseId);

          courseMap.set(courseId, {
            courseId,
            courseTitle: courseData.title,
            courseSlug: courseData.slug,
            pathSlug: pathData.slug,
            pathTitle: pathData.title,
            completedResources: completedResourceIds.includes(resource.id)
              ? 1
              : 0,
            totalResources: totalCount || 0,
            estimatedHours: 2, // Default, can be enhanced
          });
        } else if (completedResourceIds.includes(resource.id)) {
          existingCourse.completedResources += 1;
        }
      }

      // Filter to only show in-progress courses (not completed)
      const inProgress = Array.from(courseMap.values()).filter(
        (course) =>
          course.completedResources > 0 &&
          course.completedResources < course.totalResources,
      );

      setInProgressCourses(inProgress);
    } catch (error) {
      console.error("Error fetching in-progress courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading your learning...</p>
      </div>
    );
  }
  return (
    <div>
      <div className="mx-auto max-w-7xl pb-12">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl font-bold">Continue Learning</h2>
          <p className="text-muted-foreground text-lg">
            Pick up where you left off
          </p>
        </div>

        {inProgressCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-6">
              You haven't started any courses yet
            </p>
            <Link href="/browse">
              <Button className="gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Learning Paths
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {inProgressCourses.map((course) => (
              <Card
                key={course.courseId}
                className="flex flex-col p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-4">
                  <p className="text-muted-foreground mb-1 text-sm">
                    {course.pathTitle}
                  </p>
                  <h3 className="text-xl font-bold">{course.courseTitle}</h3>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {course.completedResources}/{course.totalResources}
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(course.completedResources / course.totalResources) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {course.estimatedHours} hours estimated
                  </div>
                </div>

                <Link
                  href={`/paths/${course.pathSlug}/courses/${course.courseSlug}`}
                  className="mt-4"
                >
                  <Button className="w-full gap-2">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
