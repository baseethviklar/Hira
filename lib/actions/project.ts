"use server";

import connectToDatabase from "@/lib/db";
import Project, { IProject } from "@/lib/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProject(data: { name: string; key: string; description?: string; spaceId?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await connectToDatabase();

    const project = await Project.create({
        ...data,
        owner: session.user.id,
        statuses: [
            { id: "TODO", label: "To Do", color: "bg-slate-500" },
            { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
            { id: "DONE", label: "Done", color: "bg-green-500" },
        ],
    });

    revalidatePath("/projects");
    return JSON.parse(JSON.stringify(project));
}

export async function getProjects(spaceId?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return [];
    }

    await connectToDatabase();
    const query: any = { owner: session.user.id };
    if (spaceId !== undefined) {
        query.spaceId = spaceId || null; // If empty string passed (standalone), check for null?
        // Actually, let's keep it simple: 
        // If spaceId is provided, filter by it.
        // If NOT provided, return ALL (for main page filtering).
    }
    // Wait, the main page needs ALL to split them.
    // But space details page needs ONLY specific space.

    // Let's change behavior:
    // If spaceId param is passed string, filter by that spaceId.
    // If spaceId param is passed "null" or unused, filter by logic?

    // Better: 
    if (spaceId) {
        query.spaceId = spaceId;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(projects));
}

export async function getProject(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return null;
    }

    await connectToDatabase();
    const project = await Project.findOne({ _id: id, owner: session.user.id });
    return JSON.parse(JSON.stringify(project));
}

export async function updateProject(id: string, data: { name: string; key: string; description?: string; spaceId?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    // Explicitly handle spaceId update to allow unsetting it
    const updateData: any = { ...data };
    if (data.spaceId === undefined && !("spaceId" in data)) {
        // If it's undefined and not in keys, don't update it?
        // But if I passed { spaceId: undefined }, it should be removed?
        // JSON.stringify removes undefined, so it might not reach here if strictly serialized.
        // But server actions pass objects.
    }

    if (data.spaceId === "" || data.spaceId === null) {
        updateData.$unset = { spaceId: 1 };
        delete updateData.spaceId;
    } else if (data.spaceId) {
        updateData.spaceId = data.spaceId;
    }

    // If updateData is just $unset and others, utilize standard update
    if (updateData.$unset) {
        await Project.updateOne({ _id: id, owner: session.user.id }, { $set: data, $unset: { spaceId: 1 } });
    } else {
        await Project.updateOne({ _id: id, owner: session.user.id }, updateData);
    }
    revalidatePath("/projects");
}

export async function deleteProject(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    // Check ownership
    const project = await Project.findOne({ _id: id, owner: session.user.id });
    if (!project) throw new Error("Project not found or unauthorized");

    // Cascade delete issues
    const Issue = (await import("@/lib/models/Issue")).default;
    await Issue.deleteMany({ projectId: id });

    await Project.deleteOne({ _id: id });
    revalidatePath("/projects");
    revalidatePath("/workspace");
}
