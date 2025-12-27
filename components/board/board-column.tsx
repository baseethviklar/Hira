"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { BoardCard } from "./board-card";
import { IIssue } from "@/lib/models/Issue";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
    status: { id: string; label: string; color?: string };
    issues: IIssue[];
}

export function BoardColumn({ status, issues }: BoardColumnProps) {
    const { setNodeRef } = useDroppable({
        id: status.id,
        data: {
            type: "Column",
            status,
        },
    });

    const color = status.color || "bg-slate-500";

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full w-[350px] min-w-[350px] rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
        >
            <div className={cn("px-4 py-3 rounded-t-xl font-semibold text-white flex justify-between items-center", color)}>
                <span className="text-sm tracking-wide">{status.label}</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">{issues.length}</span>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                <SortableContext items={issues.map((i) => i._id as unknown as string)} strategy={verticalListSortingStrategy}>
                    {issues.map((issue) => (
                        <BoardCard key={issue._id as unknown as string} issue={issue} />
                    ))}
                </SortableContext>
                {issues.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
}
