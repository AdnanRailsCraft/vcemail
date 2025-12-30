import { db } from "@/lib/db";

export default async function GuestAnnouncementsPage() {
  const emails = await db.email.findMany({
    where: {
      sender: {
        role: "ADMIN",
      },
    },
    orderBy: {
      sentAt: "desc",
    },
    take: 50,
    include: {
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-600">
            Published by admins. Newest first. Read-only access.
          </p>
        </div>

        {emails.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-600">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <article
                key={email.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {email.subject}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {email.sender?.name || "Admin"} •{" "}
                      {new Date(email.sentAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="prose max-w-none text-gray-900">
                  {email.bodyHtml ? (
                    <div
                      className="text-gray-900"
                      dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{email.bodyText}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

