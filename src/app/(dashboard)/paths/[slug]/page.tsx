"use client";

import { BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Button from "@/components/ui/button/Button";
import DynamicPageBreadcrumb from "@/components/common/DynamicBreadCrumb";

interface Course {
  id: string;
  title: string;
  slug: string;
  estimated_hours: number;
  order_index: number;
  description?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_hours: number;
}

export default function CoursePath() {
  const params = useParams();
  const slug = params.slug as string;
  const [path, setPath] = useState<LearningPath | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPathAndCourses();
  }, [slug]);

  const fetchPathAndCourses = async () => {
    try {
      const { data: pathData, error: pathError } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("slug", slug)
        .single();

      if (pathError) throw pathError;

      setPath(pathData);

      if (pathData) {
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("learning_path_id", pathData.id)
          .order("order_index");

        if (coursesError) throw coursesError;
        setCourses(coursesData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!path)
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
              We can't seem to find the learning path you are looking for!
            </p>

            <Link
              href="/browse"
              className="shadow-theme-xs inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
            >
              Back to Paths
            </Link>
          </div>
        </div>
      </div>
    );

  const completedCourses = 0; // TODO: fetch user progress
  const progressPercent =
    courses.length > 0 ? (completedCourses / courses.length) * 100 : 0;

  return (
    <div>
      <DynamicPageBreadcrumb pageTitle="Learning Path" />
      <div className="mx-auto max-w-7xl pb-12">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-4xl font-bold">{path.title}</h1>
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                path.difficulty_level === "Beginner"
                  ? "bg-green-100 text-green-700"
                  : path.difficulty_level === "Intermediate"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {path.difficulty_level}
            </span>
          </div>
          <p className="text-muted-foreground mb-6 text-lg">
            {path.description}
          </p>
          <div className="text-muted-foreground flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {path.estimated_hours} hours total
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {courses.length} courses
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-12 p-6">
          <h2 className="mb-4 font-semibold">Your Progress</h2>
          <Progress value={progressPercent} className="mb-2" />
          <p className="text-muted-foreground text-sm">
            {completedCourses} of {courses.length} courses completed
          </p>
        </Card>

        {/* Courses */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Courses in this Path</h2>
          {courses.map((course, index) => (
            <Card
              key={course.id}
              className="p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-bold">{course.title}</h3>
                  {course.description && (
                    <p className="text-muted-foreground mb-4 text-sm">
                      {course.description}
                    </p>
                  )}
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {course.estimated_hours} hours
                    </span>
                  </div>
                </div>
                <Link href={`/paths/${slug}/courses/${course.slug}`}>
                  <Button>Start Learning</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
