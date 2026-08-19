"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card";
import Input from "@/components/form/input/InputField";
import Link from "next/link";
import { BookOpen, Search, Filter } from "lucide-react";
import Spinner from "@/components/ui/spinner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface LearningPath {
  id: string;
  title: string;
  slug: string;
  difficulty_level: string;
  estimated_hours: number;
  category_id: string | null;
}

export default function BrowsePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order_index");

      if (error) throw error;
      const cats = data || [];
      setCategories(cats);

      // Initialize selected category from URL param
      const slug = searchParams.get("category");
      if (slug) {
        const match = cats.find((c: any) => c.slug === slug);
        if (match) setSelectedCategory(match.id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategory(catId);
    const params = new URLSearchParams(searchParams.toString());
    if (catId) {
      const cat = categories.find((c) => c.id === catId);
      if (cat) params.set("category", cat.slug);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    router.replace(qs ? `/browse?${qs}` : "/browse");
  };

  useEffect(() => {
    fetchPaths();
  }, [selectedCategory, searchTerm, difficultyFilter]);

  const fetchPaths = async () => {
    setLoading(true);
    try {
      let query = supabase.from("learning_paths").select("*");

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (difficultyFilter) {
        query = query.eq("difficulty_level", difficultyFilter);
      }

      const { data, error } = await query.order("order_index");

      if (error) throw error;

      let filtered = data || [];
      if (searchTerm) {
        filtered = filtered.filter((path: any) =>
          path.title.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      setPaths(filtered);
    } catch (error) {
      console.error("Error fetching paths:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen">
      <div className={"w-full"}>
        <div className="mx-auto max-w-7xl space-y-6 pb-12">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Explore Learning Paths</h1>
            <p className="text-muted-foreground text-lg">
              Choose your learning path and start mastering software engineering
            </p>
          </div>

          <div className="mb-8 space-y-6">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform" />
              <Input
                type="search"
                placeholder="Search learning paths..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Filter className="h-4 w-4" /> Filter by Category
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => handleCategoryChange(null)}
                  className="flex-col items-start justify-start p-2.5!"
                >
                  <span>All Categories</span>
                  <span className="text-left text-xs">
                    See all our course categories
                  </span>
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={
                      selectedCategory === cat.id ? "default" : "outline"
                    }
                    onClick={() => handleCategoryChange(cat.id)}
                    className="flex flex-col items-start justify-start p-2.5!"
                  >
                    <span className="font-bold">{cat.name}</span>
                    <span className="text-left text-xs">
                      {cat.description}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" />
                 Filter by Difficulty Level
              </h3>
              <div className="flex flex-wrap gap-3">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <Button
                    key={level}
                    variant={difficultyFilter === level ? "default" : "outline"}
                    onClick={() =>
                      setDifficultyFilter(
                        difficultyFilter === level ? null : level,
                      )
                    }
                    size="sm"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              Available Learning Paths
            </h3>
            {loading ? (
              <Spinner size="md" variant="page" label="Loading paths..." />
            ) : paths.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No learning paths found
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setDifficultyFilter(null);
                    handleCategoryChange(null);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paths.map((path) => (
                  <Card
                    key={path.id}
                    className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <div className="flex flex-1 flex-col px-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="flex-1 text-lg font-bold">
                          {path.title}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                      <p className="text-muted-foreground mb-4 flex-1 text-sm">
                        {path.estimated_hours} hours of content
                      </p>
                      <Link href={`/paths/${path.slug}`}>
                        <Button className="w-full">View Path</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
