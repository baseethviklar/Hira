import { getUserWorklogs } from "@/lib/actions/worklog";
import { getAssignedIssues } from "@/lib/actions/issue";
import { format } from "date-fns";
import { formatDuration } from "@/lib/format-time";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceCalendar } from "@/components/workspace/workspace-calendar";
import { IIssue } from "@/lib/models/Issue";
import { WorklogItem } from "@/components/workspace/worklog-item";

export default async function MyWorkspacePage() {
    const [worklogs, assignedIssues] = await Promise.all([
        getUserWorklogs(),
        getAssignedIssues()
    ]);

    // Group by date
    const groupedWorklogs: Record<string, typeof worklogs> = {};

    worklogs.forEach(log => {
        const dateKey = format(log.date, "yyyy-MM-dd");
        if (!groupedWorklogs[dateKey]) {
            groupedWorklogs[dateKey] = [];
        }
        groupedWorklogs[dateKey].push(log);
    });

    const sortedDates = Object.keys(groupedWorklogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">My Workspace</h1>
                <p className="text-muted-foreground">Manage your schedule and track your history.</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Assigned Tasks</h2>
                </div>
                {/* 
                  @ts-ignore: Mongoose ref serialization mismatch
                */}
                <WorkspaceCalendar issues={assignedIssues as unknown as IIssue[]} />
            </div>

            <div className="space-y-4 pt-6">
                <h2 className="text-xl font-semibold tracking-tight">Completed Logs</h2>
                <div className="grid gap-4">
                    {sortedDates.length === 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">No work logged yet</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Log work on issues to see them appear here.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        sortedDates.map(dateKey => (
                            <Card key={dateKey}>
                                <CardHeader className="pb-3 px-4 pt-4">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <div className="space-y-3">
                                        {groupedWorklogs[dateKey].map((log) => (
                                            <WorklogItem key={log._id as string} log={log} />
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-end">
                                        <span className="text-xs font-medium text-muted-foreground mr-2">Daily Total:</span>
                                        <span className="text-xs font-bold font-mono">
                                            {formatDuration(groupedWorklogs[dateKey].reduce((acc, curr) => acc + curr.timeSpent, 0))}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
