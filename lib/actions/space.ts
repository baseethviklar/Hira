"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Space from "@/lib/models/Space";
import Project from "@/lib/models/Project";
import { revalidatePath } from "next/cache";

export async function createSpace(data: { name: string; description?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    const space = await Space.create({
        ...data,
        owner: session.user.id,
    });

    revalidatePath("/projects");
    return JSON.parse(JSON.stringify(space));
}

export async function getSpaces() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    await connectToDatabase();
    // Fetch spaces owned by user
    const spaces = await Space.find({ owner: session.user.id }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(spaces));
}

export async function getSpace(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    await connectToDatabase();
    const space = await Space.findOne({ _id: id, owner: session.user.id });
    return JSON.parse(JSON.stringify(space));
}

export async function deleteSpace(spaceId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    // Authorization check
    const space = await Space.findOne({ _id: spaceId, owner: session.user.id });
    if (!space) throw new Error("Space not found or unauthorized");

    // Option 1: Delete all projects in space? 
    // Option 2: Move projects to root?
    // Let's go with Option 1 for now or just unset spaceId. 
    // Safest: Unset spaceId so projects become standalone.
    await Project.updateMany({ spaceId }, { $unset: { spaceId: "" } });

    await Space.deleteOne({ _id: spaceId });
    revalidatePath("/projects");
}

export async function updateSpace(spaceId: string, data: { name: string; description?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    await Space.updateOne({ _id: spaceId, owner: session.user.id }, data);
    revalidatePath("/projects");
}
