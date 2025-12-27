"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDuration } from "@/lib/format-time";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditWorklogDialog } from "./edit-worklog-dialog";

interface WorklogItemProps {
    log: {
        _id: string;
        issueId: string;
        issueTitle: string;
        issueProjectId: string;
        timeSpent: number;
        description?: string;
    };
}

export function WorklogItem({ log }: WorklogItemProps) {
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between text-sm group">
                <div className="grid gap-1">
                    <Link href={`/projects/${log.issueProjectId}`} className="font-medium hover:underline text-primary truncate max-w-[300px]">
                        {log.issueTitle}
                    </Link>
                    <p className="text-muted-foreground line-clamp-1">
                        {log.description || "No description"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="font-mono font-medium text-xs bg-muted px-2 py-1 rounded">
                        {formatDuration(log.timeSpent)}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setEditOpen(true)}
                    >
                        <Edit2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            <EditWorklogDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                issueId={log.issueId}
                worklogId={log._id}
                initialTimeSpent={log.timeSpent}
                initialDescription={log.description}
            />
        </>
    );
}
