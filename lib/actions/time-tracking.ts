"use server";

import connectToDatabase from "@/lib/db";
import Issue from "@/lib/models/Issue";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function logWork(issueId: string, data: { timeSpent: number; description?: string; date?: Date }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error("Issue not found");

    const newWorklog = {
        userId: session.user.id,
        timeSpent: data.timeSpent,
        description: data.description,
        date: data.date || new Date(),
    };

    issue.worklogs.push(newWorklog);
    issue.timeSpent += data.timeSpent;

    // Decrease remaining estimate by the logged amount, but don't go below 0
    if (issue.remainingEstimate > 0) {
        issue.remainingEstimate = Math.max(0, issue.remainingEstimate - data.timeSpent);
    }

    await issue.save();

    revalidatePath(`/projects/${issue.projectId}`);
    return JSON.parse(JSON.stringify(issue));
}

export async function updateEstimates(issueId: string, data: { originalEstimate?: number; remainingEstimate?: number }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error("Issue not found");

    if (typeof data.originalEstimate !== 'undefined') issue.originalEstimate = data.originalEstimate;
    if (typeof data.remainingEstimate !== 'undefined') issue.remainingEstimate = data.remainingEstimate;

    await issue.save();
    revalidatePath(`/projects/${issue.projectId}`);
    return JSON.parse(JSON.stringify(issue));
}
