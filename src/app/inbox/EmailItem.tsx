import { useState, useEffect } from "react";
import Link from "next/link";
import { Email } from "@prisma/client";

export default function EmailItem({ email }: { email: Email }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: Date) => {
    if (!mounted) return "";
    const date = new Date(dateString);
    return date.toLocaleString([], { month: "short", day: "numeric" });
  };

  // Truncate the subject if it's too long
  const truncateSubject = (subject: string, maxLength: number = 60) => {
    if (subject.length <= maxLength) return subject;
    return subject.substring(0, maxLength) + "...";
  };

  // Truncate the body if it exists
  const truncateBody = (body: string | null, maxLength: number = 100) => {
    if (!body) return "";
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + "...";
  };

  // Extract sender name from email address
  const getSenderName = (emailAddress: string) => {
    const name = emailAddress.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <li className="hover:bg-gray-50 transition-colors">
      <Link href={`/inbox/${email.id}`} className="block">
        <div className="flex items-center px-3 sm:px-4 py-3 gap-2 sm:gap-4 overflow-hidden">
          <div className="flex items-center space-x-2 sm:space-x-3 w-32 sm:w-48 flex-shrink-0">
            <input
              type="checkbox"
              className="hidden sm:block h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
            <button
              className="hidden sm:block text-gray-400 hover:text-yellow-500"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title={email.isStarred ? "Starred" : "Star"}
            >
              {email.isStarred ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499c.215-.66 1.125-.66 1.34 0l1.558 4.77a1 1 0 00.95.69h5.012c.695 0 .985.889.423 1.3l-4.053 2.946a1 1 0 00-.364 1.118l1.559 4.77c.214.66-.537 1.21-1.098.8l-4.053-2.946a1 1 0 00-1.176 0l-4.052 2.946c-.561.41-1.312-.14-1.098-.8l1.559-4.77a1 1 0 00-.364-1.118L3.236 10.26c-.562-.411-.272-1.3.423-1.3h5.011a1 1 0 00.951-.69l1.559-4.77z" />
                </svg>
              )}
            </button>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
              {getSenderName(email.from).charAt(0)}
            </div>
            <p className={`truncate text-sm ${email.isRead ? "text-gray-700" : "font-semibold text-gray-900"}`}>
              {getSenderName(email.from)}
            </p>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:space-x-2 min-w-0">
            <p className={`truncate text-sm ${email.isRead ? "text-gray-900" : "font-semibold text-gray-900"}`}>
              {truncateSubject(email.subject)}
            </p>
            <p className="truncate text-sm text-gray-500">
              <span className="hidden sm:inline">- </span>
              {truncateBody(email.bodyText)}
            </p>
          </div>

          <p className="w-16 sm:w-20 text-right text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
            {formatDate(email.sentAt)}
          </p>
        </div>
      </Link>
    </li>
  );
}