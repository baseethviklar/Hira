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
    startDate?: Date;
    endDate?: Date;
    originalEstimate?: number;
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
        remainingEstimate: data.originalEstimate || 0,
        reporterId: session.user.id,
        assigneeId: session.user.id,
        order,
    });

    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath("/workspace");
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
    revalidatePath("/workspace");
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
    revalidatePath("/workspace");
}

export async function updateIssueDetails(issueId: string, data: {
    title: string;
    description?: string;
    priority: string;
    type: string;
    startDate?: Date;
    endDate?: Date;
    originalEstimate?: number;
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
    issue.startDate = data.startDate;
    issue.endDate = data.endDate;

    if (data.originalEstimate !== undefined && data.originalEstimate !== issue.originalEstimate) {
        issue.originalEstimate = data.originalEstimate;
        // Recalculate remaining estimate based on new original and existing timeSpent
        const spent = issue.timeSpent || 0;
        issue.remainingEstimate = Math.max(0, (data.originalEstimate || 0) - spent);
    }

    await issue.save();

    revalidatePath(`/projects/${issue.projectId}`);
    revalidatePath("/workspace");
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
    revalidatePath("/workspace");
}

export async function getAssignedIssues() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    await connectToDatabase();
    // Fetch issues assigned to the user or where the user is the reporter? User said "assigned task".
    // Let's stick to Assignee. If assigneeId is missing in schema, we might fallback to reporter for now or update schema.
    // The current schema has assigneeId.
    const issues = await Issue.find({
        $or: [
            { assigneeId: session.user.id },
            { reporterId: session.user.id }
        ]
    }).sort({ startDate: 1 });
    return JSON.parse(JSON.stringify(issues));
}
