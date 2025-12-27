"use server";

import connectToDatabase from "@/lib/db";
import Issue, { IIssue, IWorklog } from "@/lib/models/Issue";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface UserWorklog extends IWorklog {
    _id: string;
    issueId: string;
    issueTitle: string;
    issueProjectId: string;
}

import { redirect } from "next/navigation";

export async function getUserWorklogs(): Promise<UserWorklog[]> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    await connectToDatabase();

    // Find all issues where worklogs.userId matches current user
    const issues = await Issue.find({ "worklogs.userId": session.user.id })
        .select("title projectId worklogs")
        .lean();

    const userWorklogs: UserWorklog[] = [];

    issues.forEach((issue: any) => {
        if (issue.worklogs && Array.isArray(issue.worklogs)) {
            issue.worklogs.forEach((log: any) => {
                if (log.userId.toString() === session.user.id) {
                    userWorklogs.push({
                        ...log,
                        _id: log._id.toString(),
                        userId: log.userId.toString(),
                        date: new Date(log.date),
                        issueId: issue._id.toString(),
                        issueTitle: issue.title,
                        issueProjectId: issue.projectId.toString(),
                    });
                }
            });
        }
    });

    // Sort by date descending
    return userWorklogs.sort((a, b) => b.date.getTime() - a.date.getTime());
}
