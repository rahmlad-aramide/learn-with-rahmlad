"use client";
import { createClient } from "@/lib/supabase/client";
import { useRef, useState } from "react";
import Spinner from "@/components/ui/spinner";

interface ImportStats {
  paths: { created: number; updated: number };
  courses: { created: number; updated: number };
  resources: { created: number; errors: number };
}

interface RawRow {
  SN: string;
  PATH: string;
  CATEGORY: string;
  "COURSE/CHALLENGE": string;
  "TITLE/PROJECT": string;
  "TEXTUAL RESOURCE LINKS": string;
  "VIDEO TUTORIAL": string;
  "VIDEO EMBEDDED LINK": string;
  "DETAILS/OTHER LINKS": string;
  "RESOURCE BY / SOURCE": string;
  DIFFICULTY: string;
  [key: string]: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ContentImportPage() {
  const [status, setStatus] = useState<
    "idle" | "parsing" | "importing" | "done" | "error"
  >("idle");
  const [preview, setPreview] = useState<RawRow[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setStatus("parsing");
    setPreview([]);
    setStats(null);
    setErrorMsg("");

    try {
      const Papa = await import("papaparse");
      const text = await selectedFile.text();
      const result = Papa.default.parse<RawRow>(text, {
        header: true,
        skipEmptyLines: true,
      });
      setPreview(result.data.slice(0, 10));
      setStatus("idle");
    } catch {
      setErrorMsg(
        "Failed to parse CSV. Make sure it matches the expected format.",
      );
      setStatus("error");
    }
  };

  const runImport = async () => {
    if (!file) return;

    setStatus("importing");
    const stats: ImportStats = {
      paths: { created: 0, updated: 0 },
      courses: { created: 0, updated: 0 },
      resources: { created: 0, errors: 0 },
    };

    try {
      const Papa = await import("papaparse");
      const text = await file.text();
      const { data } = Papa.default.parse<RawRow>(text, {
        header: true,
        skipEmptyLines: true,
      });

      const supabase = createClient();
      const pathCache: Record<string, string> = {};
      const categoryCache: Record<string, string> = {};
      let currentCourseId: string | null = null;
      let currentPaths: string[] = [];
      let resourceOrder = 0;

      for (const row of data) {
        const difficulty = (
          row["DIFFICULTY"] ??
          row["Difficulty"] ??
          "Beginners"
        ).trim();
        const normalized = difficulty === "Beginners" ? "Beginner" : difficulty;

        // New course group starts when SN is non-empty
        if (row["SN"]?.trim()) {
          resourceOrder = 0;
          const courseTitle = row["COURSE/CHALLENGE"]?.trim();
          const pathNames = (row["PATH"] ?? "")
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
          const categoryName = (row["CATEGORY"] ?? "").trim();

          if (!courseTitle) continue;

          // Resolve category_id if CATEGORY column is present
          let resolvedCategoryId: string | null = null;
          if (categoryName) {
            if (!categoryCache[categoryName]) {
              const catSlug = slugify(categoryName);
              const { data: existingCat } = await supabase
                .from("categories")
                .select("id")
                .eq("slug", catSlug)
                .single();
              if (existingCat) {
                categoryCache[categoryName] = existingCat.id;
              }
            }
            resolvedCategoryId = categoryCache[categoryName] ?? null;
          }

          // Ensure all referenced paths exist
          currentPaths = [];
          for (const pathName of pathNames) {
            if (!pathCache[pathName]) {
              const slug = slugify(pathName);
              const { data: existing } = await supabase
                .from("learning_paths")
                .select("id, category_id")
                .eq("slug", slug)
                .single();

              if (existing) {
                pathCache[pathName] = existing.id;
                stats.paths.updated++;
                // Backfill category_id if path had none
                if (!existing.category_id && resolvedCategoryId) {
                  await supabase
                    .from("learning_paths")
                    .update({ category_id: resolvedCategoryId })
                    .eq("id", existing.id);
                }
              } else {
                const { data: created } = await supabase
                  .from("learning_paths")
                  .insert({
                    title: pathName,
                    slug,
                    difficulty_level: normalized,
                    ...(resolvedCategoryId
                      ? { category_id: resolvedCategoryId }
                      : {}),
                  })
                  .select("id")
                  .single();
                if (created) {
                  pathCache[pathName] = created.id;
                  stats.paths.created++;
                }
              }
            }
            if (pathCache[pathName]) currentPaths.push(pathCache[pathName]);
          }

          // Upsert course
          const courseSlug = slugify(courseTitle);
          const primaryPathId = currentPaths[0] ?? null;

          const { data: existingCourse } = await supabase
            .from("courses")
            .select("id")
            .eq("slug", courseSlug)
            .single();

          if (existingCourse) {
            currentCourseId = existingCourse.id;
            stats.courses.updated++;
          } else {
            const { data: newCourse } = await supabase
              .from("courses")
              .insert({
                title: courseTitle,
                slug: courseSlug,
                order_index: parseInt(row["SN"]) || 0,
              })
              .select("id")
              .single();
            if (newCourse) {
              currentCourseId = newCourse.id;
              stats.courses.created++;

              // Wire into course_paths junction
              for (const [i, pathId] of currentPaths.entries()) {
                await supabase.from("course_paths").upsert(
                  {
                    course_id: newCourse.id,
                    learning_path_id: pathId,
                    is_primary: i === 0,
                    order_index: parseInt(row["SN"]) || 0,
                  },
                  { onConflict: "course_id,learning_path_id" },
                );
              }
            }
          }
        }

        // Create resource if TITLE/PROJECT is present
        const title = row["TITLE/PROJECT"]?.trim();
        if (!title || !currentCourseId) continue;

        const videoEmbed = row["VIDEO EMBEDDED LINK"]?.trim() || null;
        const textUrl = row["TEXTUAL RESOURCE LINKS"]?.trim() || null;
        const videoTutorialUrl = row["VIDEO TUTORIAL"]?.trim() || null;
        const resourceType =
          videoEmbed || videoTutorialUrl ? "video" : "article";
        const url = textUrl || videoEmbed || videoTutorialUrl || null;

        try {
          await supabase.from("resources").insert({
            title,
            course_id: currentCourseId,
            type: resourceType,
            url,
            video_embed_url: videoEmbed || null,
            video_url: videoTutorialUrl,
            details: row["DETAILS/OTHER LINKS"]?.trim() || null,
            source: row["RESOURCE BY / SOURCE"]?.trim() || null,
            difficulty: normalized || null,
            order_index: resourceOrder++,
          });
          stats.resources.created++;
        } catch {
          stats.resources.errors++;
        }
      }

      setStats(stats);
      setStatus("done");
    } catch (err) {
      setErrorMsg(String(err));
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Import Course Content
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV exported from your spreadsheet. Columns expected: SN,
          CATEGORY, PATH, COURSE/CHALLENGE, TITLE/PROJECT, TEXTUAL RESOURCE
          LINKS, VIDEO TUTORIAL, VIDEO EMBEDDED LINK, DETAILS/OTHER LINKS,
          RESOURCE BY / SOURCE, DIFFICULTY. CATEGORY is optional but sets the
          learning path category when present.
        </p>
      </div>

      {/* File upload */}
      <div
        className="hover:border-brand-400 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-white/[0.02]"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <svg
          className="mb-3 h-10 w-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {fileName || "Drop your CSV here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-gray-400">CSV files only</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* Preview */}
      {preview.length > 0 && status === "idle" && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Preview (first {preview.length} rows)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  {[
                    "SN",
                    "CATEGORY",
                    "PATH",
                    "COURSE/CHALLENGE",
                    "TITLE/PROJECT",
                    "DIFFICULTY",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-medium text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {preview.map((row, i) => (
                  <tr key={i} className="bg-white dark:bg-white/[0.02]">
                    <td className="px-3 py-2 text-gray-600">{row["SN"]}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {row["CATEGORY"]}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{row["PATH"]}</td>
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {row["COURSE/CHALLENGE"]}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {row["TITLE/PROJECT"]}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {row["DIFFICULTY"]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={runImport}
            className="bg-brand-500 hover:bg-brand-600 mt-4 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition duration-200 active:scale-90 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Run Import
          </button>
        </div>
      )}

      {status === "importing" && (
        <Spinner
          size="sm"
          variant="banner"
          label="Importing… this may take a moment."
        />
      )}

      {status === "done" && stats && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <h2 className="mb-3 font-semibold text-green-800 dark:text-green-300">
            Import Complete
          </h2>
          <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
            <li>
              Paths — {stats.paths.created} created, {stats.paths.updated}{" "}
              already existed
            </li>
            <li>
              Courses — {stats.courses.created} created, {stats.courses.updated}{" "}
              already existed
            </li>
            <li>
              Resources — {stats.resources.created} created,{" "}
              {stats.resources.errors} errors
            </li>
          </ul>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
