"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import React, { useState } from "react";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";

export default function SupportForm() {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subject.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const fullName = profile
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : "User";
      const email = profile?.email ?? "";

      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send");
      }

      setSuccess(true);
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Contact Support
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Having an issue or need help? Describe it below and we&apos;ll get
          back to you as soon as possible.
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-500/20 dark:bg-green-500/10">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.707a1 1 0 00-1.414-1.414L10 13.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l6-6z"
                fill="#16a34a"
              />
            </svg>
          </div>
          <h4 className="mb-1 font-semibold text-green-800 dark:text-green-400">
            Message sent!
          </h4>
          <p className="text-sm text-green-700 dark:text-green-500">
            We&apos;ve received your request and will respond to your email
            shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 text-sm text-green-700 underline underline-offset-2 dark:text-green-400"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
          {/* Read-only user info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                type="text"
                value={
                  profileLoading
                    ? "Loading..."
                    : profile
                      ? `${profile.first_name} ${profile.last_name}`.trim()
                      : ""
                }
                disabled
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={profileLoading ? "Loading..." : (profile?.email ?? "")}
                disabled
              />
            </div>
          </div>

          <div>
            <Label>
              Subject <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="Briefly describe your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>
              Message <span className="text-error-500">*</span>
            </Label>
            <textarea
              className="dark:bg-dark-900 focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-36 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition outline-none focus:ring-3 disabled:bg-gray-100 dark:border-gray-700 dark:text-white/90 dark:placeholder-white/30"
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-error-50 text-error-500 dark:bg-error-500/10 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="sm" disabled={loading || profileLoading}>
            {loading ? "Sending…" : "Send Message"}
          </Button>
        </form>
      )}
    </div>
  );
}
