"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IIssue } from "@/lib/models/Issue";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { EditIssueDialog } from "./edit-issue-dialog";

interface BoardCardProps {
    issue: IIssue;
}

export function BoardCard({ issue }: BoardCardProps) {
    const [open, setOpen] = useState(false);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: issue._id as unknown as string,
        data: {
            type: "Issue",
            issue,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 h-[100px] bg-slate-200 dark:bg-slate-700 rounded-lg border-2 border-primary"
            />
        );
    }

    const priorityColors = {
        LOW: "bg-green-500/10 text-green-500 border-green-500/20",
        MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        HIGH: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => setOpen(true)}
                className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
                <CardHeader className="p-3 pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium leading-tight select-none">
                            {issue.title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                    <div className="flex gap-2 items-center mt-2">
                        <Badge variant="outline" className={priorityColors[issue.priority as keyof typeof priorityColors] || ""}>
                            {issue.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono border px-1.5 py-0.5 rounded flex items-center bg-muted/50">
                            {issue.type}
                        </span>
                    </div>
                </CardContent>
            </Card>
            <EditIssueDialog issue={issue} open={open} onOpenChange={setOpen} />
        </>
    );
}
