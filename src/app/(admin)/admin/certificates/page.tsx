"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";

interface Template {
  id: string;
  name: string;
  storage_path: string;
  learning_path_id: string | null;
  name_x: number;
  name_y: number;
  date_x: number;
  date_y: number;
  course_x: number;
  course_y: number;
  font_size: number;
  learning_paths?: { title: string } | null;
}

interface LearningPath {
  id: string;
  title: string;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function AdminCertificatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    learning_path_id: "",
    name_x: "0.5",
    name_y: "0.6",
    date_x: "0.5",
    date_y: "0.75",
    course_x: "0.5",
    course_y: "0.5",
    font_size: "36",
  });

  const supabase = createClient();

  const fetchAll = async () => {
    const [{ data: tmpl }, { data: lp }] = await Promise.all([
      supabase
        .from("certificate_templates")
        .select("*, learning_paths(title)")
        .order("created_at", { ascending: false }),
      supabase.from("learning_paths").select("id, title").order("title"),
    ]);
    setTemplates(tmpl ?? []);
    setPaths(lp ?? []);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !form.name) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const storagePath = `templates/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("certificate-templates")
      .upload(storagePath, file, { upsert: false });

    if (uploadErr) {
      alert(`Upload failed: ${uploadErr.message}`);
      setUploading(false);
      return;
    }

    await supabase.from("certificate_templates").insert({
      name: form.name,
      storage_path: storagePath,
      learning_path_id: form.learning_path_id || null,
      name_x: parseFloat(form.name_x),
      name_y: parseFloat(form.name_y),
      date_x: parseFloat(form.date_x),
      date_y: parseFloat(form.date_y),
      course_x: parseFloat(form.course_x),
      course_y: parseFloat(form.course_y),
      font_size: parseInt(form.font_size),
    });

    setUploading(false);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = "";
    await fetchAll();
  };

  const handleDelete = async (template: Template) => {
    await supabase.storage
      .from("certificate-templates")
      .remove([template.storage_path]);
    await supabase.from("certificate_templates").delete().eq("id", template.id);
    await fetchAll();
  };

  const posField = (label: string, key: keyof typeof form) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label} (0–1)
      </label>
      <input
        type="number"
        step="0.05"
        min="0"
        max="1"
        className={inputClass}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Certificate Templates
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload your certificate design (JPG/PNG, A4 landscape recommended).
            Set text positions using relative values (0 = left/top, 1 =
            right/bottom).
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          {showForm ? "Cancel" : "+ Upload Template"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">
            New Template
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Template Name *
              </label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Frontend Path Certificate"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Learning Path (optional)
              </label>
              <select
                className={inputClass}
                value={form.learning_path_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, learning_path_id: e.target.value }))
                }
              >
                <option value="">— No specific path —</option>
                {paths.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Image File (JPG or PNG) *
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Font Size
              </label>
              <input
                type="number"
                className={inputClass}
                value={form.font_size}
                onChange={(e) =>
                  setForm((f) => ({ ...f, font_size: e.target.value }))
                }
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                Text Positions
              </p>
              <div className="grid grid-cols-2 gap-3">
                {posField("Student Name X", "name_x")}
                {posField("Student Name Y", "name_y")}
                {posField("Path Name X", "course_x")}
                {posField("Path Name Y", "course_y")}
                {posField("Date X", "date_x")}
                {posField("Date Y", "date_y")}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Tip: (0.5, 0.5) = center of page. Increase Y to move text lower.
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !form.name}
              className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Save Template"}
            </button>
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <p className="text-sm text-gray-500">No templates uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]"
            >
              <div>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {t.name}
                </p>
                <p className="text-xs text-gray-500">
                  {t.learning_paths?.title ?? "All paths"} · Font {t.font_size}
                  px
                </p>
              </div>
              <button
                onClick={() => handleDelete(t)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
