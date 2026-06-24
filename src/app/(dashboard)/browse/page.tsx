"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card";
import Input from "@/components/form/input/InputField";
import Link from "next/link";
import { BookOpen, Search, Filter, LogOut } from "lucide-react";

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
  category_id: string;
}

export default function BrowsePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    setUser(authUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order_index");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
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
        <div className="mx-auto max-w-7xl pb-12">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold">Explore Learning Paths</h1>
            <p className="text-muted-foreground text-lg">
              Choose your learning path and start mastering software engineering
            </p>
          </div>

          <div className="mb-12 space-y-6">
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
                <Filter className="h-4 w-4" /> Categories
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className="justify-start"
                >
                  All Categories
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={
                      selectedCategory === cat.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedCategory(cat.id)}
                    className="justify-start"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Difficulty Level</h3>
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading paths...</p>
            </div>
          ) : paths.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No learning paths found
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setDifficultyFilter(null);
                  setSelectedCategory(null);
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
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="flex-1 text-lg font-bold">{path.title}</h3>
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
  );
}
