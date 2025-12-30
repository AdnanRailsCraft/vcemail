import { createUser } from "@/actions/userActions";
import {UserRole} from "@prisma/client";

export default function SetupPage() {
  const createAdminUser = async () => {
    "use server";
    await createUser({
      email: "admin@vcemail.local",
      name: "Admin User",
      password: "admin123",
      role: UserRole.ADMIN
    });
  };

  const createReadOnlyUser = async () => {
    "use server";
    await createUser({
      email: "readonly@vcemail.local",
      name: "Read Only User",
      password: "readonly123",
      role: UserRole.READ_ONLY
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            VC Email System Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create initial users for testing
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <form action={createAdminUser} className="space-y-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Create Admin User
            </button>
          </form>
          
          <form action={createReadOnlyUser} className="space-y-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Read-Only User
            </button>
          </form>
          
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800">Default Credentials:</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p><strong>Admin:</strong> admin@vcemail.local / admin123</p>
              <p><strong>Read-Only:</strong> readonly@vcemail.local / readonly123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}