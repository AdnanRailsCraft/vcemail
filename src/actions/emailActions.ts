"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";

async function getSession() {
    return await getServerSession(authOptions);
}

export async function toggleStar(emailId: string, isStarred: boolean) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        await db.email.update({
            where: { id: emailId },
            data: { isStarred }
        });
        revalidatePath("/inbox");
        revalidatePath(`/inbox/${emailId}`);
        return { success: true };
    } catch (error) {
        console.error("Error toggling star:", error);
        return { success: false, error: "Failed to update star status" };
    }
}

export async function toggleReadStatus(emailId: string, isRead: boolean) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        await db.email.update({
            where: { id: emailId },
            data: { isRead }
        });
        revalidatePath("/inbox");
        revalidatePath(`/inbox/${emailId}`);
        return { success: true };
    } catch (error) {
        console.error("Error toggling read status:", error);
        return { success: false, error: "Failed to update read status" };
    }
}

export async function deleteEmail(emailId: string) {
    try {
        const session = await getSession();
        if (!session || session.user?.role !== "ADMIN") {
            return { success: false, error: "Unauthorized - Admin access required" };
        }

        // Check if email exists and user has access
        const email = await db.email.findFirst({
            where: { 
                id: emailId,
                OR: [
                    { senderId: session.user.id },
                    { to: session.user.email || "" }
                ]
            }
        });

        if (!email) {
            return { success: false, error: "Email not found or you don't have permission to delete it" };
        }

        await db.email.delete({
            where: { id: emailId }
        });
        
        revalidatePath("/inbox");
        revalidatePath(`/inbox/${emailId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting email:", error);
        return { success: false, error: error.message || "Failed to delete email" };
    }
}
