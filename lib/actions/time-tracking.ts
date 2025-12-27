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

export async function updateWorklog(issueId: string, worklogId: string, data: { timeSpent: number; description?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error("Issue not found");

    const worklog = issue.worklogs.id(worklogId);
    if (!worklog) throw new Error("Worklog not found");

    if (worklog.userId.toString() !== session.user.id) {
        throw new Error("Unauthorized to edit this worklog");
    }

    const oldTimeSpent = worklog.timeSpent;
    const newTimeSpent = data.timeSpent;

    // Update worklog
    worklog.timeSpent = newTimeSpent;
    if (data.description !== undefined) worklog.description = data.description;

    // Update issue totals
    issue.timeSpent = (issue.timeSpent || 0) - oldTimeSpent + newTimeSpent;

    // Update remaining estimate
    // If we increased time spent, remaining should decrease.
    // Remaining = Remaining - (New - Old)
    // Example: Old=30, New=60. Diff=30. Remaining -= 30.
    const timeDiff = newTimeSpent - oldTimeSpent;
    if (issue.remainingEstimate > 0) {
        issue.remainingEstimate = Math.max(0, issue.remainingEstimate - timeDiff);
    }

    // Also, if previously remaining was 0 but we reduced logged time, should we increase remaining?
    // Usually Jira does not auto-increase remaining on worklog deletion/reduction unless configured.
    // Let's stick to the behavior: logging more reduces remaining. Logging less... technically "gives back" time?
    // For simplicity, let's just subtract the diff, capping at 0.
    // If diff is negative (logged less), remaining increases.

    await issue.save();

    revalidatePath(`/projects/${issue.projectId}`);
    return JSON.parse(JSON.stringify(issue));
}

export async function deleteWorklog(issueId: string, worklogId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error("Issue not found");

    const worklog = issue.worklogs.id(worklogId);
    if (!worklog) throw new Error("Worklog not found");

    if (worklog.userId.toString() !== session.user.id) {
        throw new Error("Unauthorized to delete this worklog");
    }

    const timeSpentToRemove = worklog.timeSpent;

    // Remove worklog
    issue.worklogs.pull({ _id: worklogId });

    // Update issue totals
    // Ensure we don't go negative on timeSpent (though unlikely if logic is correct)
    issue.timeSpent = Math.max(0, (issue.timeSpent || 0) - timeSpentToRemove);

    // Update remaining estimate
    // If we delete work, we "put back" the remaining time.
    issue.remainingEstimate = (issue.remainingEstimate || 0) + timeSpentToRemove;

    await issue.save();

    revalidatePath(`/projects/${issue.projectId}`);
    return JSON.parse(JSON.stringify(issue));
}
