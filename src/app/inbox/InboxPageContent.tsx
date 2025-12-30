"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { User } from "next-auth";
import EmailList from "./EmailList";

interface InboxPageContentProps {
  user: User;
}

export default function InboxPageContent({ user }: InboxPageContentProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-gray-900">Inbox</p>
            <p className="text-sm text-gray-500">New messages are shown first</p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <Link
              href="/"
              className="inline-flex flex-shrink-0 items-center px-3 py-2 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7 1.414 1.414L4 9.414V16a2 2 0 002 2h2v-4a2 2 0 114 0v4h2a2 2 0 002-2V9.414l.293.293 1.414-1.414-7-7z" />
              </svg>
              Home
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/compose"
                className="inline-flex flex-shrink-0 items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                Compose
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="inline-flex flex-shrink-0 items-center px-3 py-2 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                <path d="M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <EmailList />
      </div>
    </div>
  );
}