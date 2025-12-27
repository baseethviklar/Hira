"use server";

import connectToDatabase from "@/lib/db";
import Project, { IProject } from "@/lib/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProject(data: { name: string; key: string; description?: string }) {
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

export async function getProjects() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return [];
    }

    await connectToDatabase();
    const projects = await Project.find({ owner: session.user.id }).sort({ createdAt: -1 });
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

export async function updateProject(id: string, data: { name: string; key: string; description?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();
    await Project.updateOne({ _id: id, owner: session.user.id }, data);
    revalidatePath("/projects");
}

export async function deleteProject(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();
    await Project.deleteOne({ _id: id, owner: session.user.id });
    revalidatePath("/projects");
}
