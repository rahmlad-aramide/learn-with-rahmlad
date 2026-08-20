"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";

export default function LandingContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder-white/30 dark:focus:border-blue-600";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in name, email, and message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-border border-t py-24" id="contact">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Get in touch
          </h2>
          <p className="text-muted-foreground">
            Questions, feedback, or want to contribute? We&apos;d love to hear
            from you.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center dark:border-green-500/20 dark:bg-green-500/5">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
              <svg
                width="28"
                height="28"
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
            <h3 className="mb-2 text-xl font-semibold text-green-800 dark:text-green-400">
              Message sent!
            </h3>
            <p className="mb-6 text-green-700 dark:text-green-500">
              Thanks for reaching out. We&apos;ll get back to you as soon as
              possible.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-sm text-green-700 underline underline-offset-2 dark:text-green-400"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="What's this about?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6">
              <Button
                type="submit"
                size="md"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Sending…" : "Send Message"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
