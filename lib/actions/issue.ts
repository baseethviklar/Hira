"use server";

import connectToDatabase from "@/lib/db";
import Issue, { IIssue } from "@/lib/models/Issue";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createIssue(data: {
    title: string;
    description?: string;
    projectId: string;
    priority: string;
    type: string;
    status: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await connectToDatabase();

    // Get max order for the status
    const lastIssue = await Issue.findOne({ projectId: data.projectId, status: data.status }).sort({ order: -1 });
    const order = lastIssue ? lastIssue.order + 1 : 0;

    const issue = await Issue.create({
        ...data,
        reporterId: session.user.id,
        order,
    });

    revalidatePath(`/projects/${data.projectId}`);
    return JSON.parse(JSON.stringify(issue));
}

export async function getIssues(projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return [];
    }

    await connectToDatabase();
    const issues = await Issue.find({ projectId }).sort({ order: 1 });
    return JSON.parse(JSON.stringify(issues));
}

export async function updateIssueStatus(issueId: string, status: string, order: number, projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();
    await Issue.updateOne({ _id: issueId }, { status, order });
    revalidatePath(`/projects/${projectId}`);
}

export async function updateIssueOrder(items: { id: string; order: number; status: string }[], projectId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    // Bulk write for performance
    const operations = items.map((item) => ({
        updateOne: {
            filter: { _id: item.id },
            update: { order: item.order, status: item.status }
        }
    }));

    if (operations.length > 0) {
        await Issue.bulkWrite(operations);
    }

    revalidatePath(`/projects/${projectId}`);
}

export async function updateIssueDetails(issueId: string, data: {
    title: string;
    description?: string;
    priority: string;
    type: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error("Issue not found");

    issue.title = data.title;
    issue.description = data.description;
    issue.priority = data.priority;
    issue.type = data.type;

    await issue.save();

    revalidatePath(`/projects/${issue.projectId}`);
    return JSON.parse(JSON.stringify(issue));
}

export async function deleteIssue(issueId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error("Issue not found");

    await Issue.deleteOne({ _id: issueId });

    revalidatePath(`/projects/${issue.projectId}`);
}
