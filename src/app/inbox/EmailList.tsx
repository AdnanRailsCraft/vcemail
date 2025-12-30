"use client";

import { useState, useEffect, useCallback } from "react";
import { Email } from "@prisma/client";
import EmailItem from "./EmailItem";

export default function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch emails function
  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/emails");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch emails");
      }

      setEmails(data.emails || data.emails);
    } catch (err) {
      console.error("Error fetching emails:", err);
      setError(err instanceof Error ? err.message : "Failed to load emails");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    fetchEmails();
  };

  // Initial fetch
  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex flex-col gap-3 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={selectAll}
              onChange={(e) => setSelectAll(e.target.checked)}
            />
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
              title="Refresh"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0014-7 9 9 0 00-14-7" />
              </svg>
            </button>
            <button
              className="p-2 rounded-full hover:bg-gray-200 text-gray-600"
              title="More actions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      <div>
        <ul className="divide-y divide-gray-100">
          {emails.length === 0 ? (
            <li className="px-6 py-12 text-center">
              <div className="flex justify-center">
                <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No emails yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your latest messages will appear in this list.
              </p>
            </li>
          ) : (
            emails.map((email) => (
              <EmailItem key={email.id} email={email} />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}