"use client";

import { User } from "next-auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ComposeEmailContentProps {
  user: User;
}

export default function ComposeEmailContent({ user }: ComposeEmailContentProps) {
  const [to] = useState("readonly@vcemail.local");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if user has permission to compose emails
  if (user?.role !== "ADMIN") {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-red-800">Access Denied</h3>
          <p className="mt-1 max-w-2xl text-sm text-red-600">You don't have permission to compose emails.</p>
          <div className="mt-4">
            <a
              href="/inbox"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Inbox
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError("");

    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          text: body,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/inbox");
        router.refresh();
      } else {
        setError(result.error || "Failed to send email");
      }
    } catch (err) {
      setError("An error occurred while sending the email");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Announcement</p>
              <h1 className="text-2xl font-semibold text-gray-900">Compose</h1>
              <p className="text-xs text-gray-700 mt-1">
                Publishes to the guest board (read-only audience).
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/inbox")}
              className="px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 text-sm">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <input type="hidden" value={to} readOnly />

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-800 uppercase tracking-wide">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="Announcement subject"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-800 uppercase tracking-wide">
                Message
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={14}
                className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write your announcement..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
                >
                  {isSending ? "Sending..." : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTo("readonly@vcemail.local");
                    setSubject("");
                    setBody("");
                  }}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  Clear
                </button>
              </div>
              <p className="text-xs text-gray-800">Guests cannot reply or forward.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}