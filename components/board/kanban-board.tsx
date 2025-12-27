"use client";

import { useMemo, useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BoardColumn } from "./board-column";
import { BoardCard } from "./board-card";
import { updateIssueOrder } from "@/lib/actions/issue";
import { IIssue } from "@/lib/models/Issue";
import { IProject } from "@/lib/models/Project";
import { createPortal } from "react-dom";

interface KanbanBoardProps {
    project: IProject;
    initialIssues: IIssue[];
}

export function KanbanBoard({ project, initialIssues }: KanbanBoardProps) {
    const [issues, setIssues] = useState<IIssue[]>(initialIssues);
    const [activeIssue, setActiveIssue] = useState<IIssue | null>(null);

    // Sync with server state when initialIssues change (e.g. valid revalidation)
    //   useEffect(() => {
    //     setIssues(initialIssues);
    //   }, [initialIssues]); 
    // Disable automatic sync to prevent jumping during optimistic updates if not needed.
    // Actually, for real-time feeling without websocket, we rely on revalidatePath which updates initialIssues.
    // We should update issues if initialIssues changes, but maybe check if we are dragging?

    useEffect(() => {
        setIssues(initialIssues);
    }, [initialIssues]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor)
    );

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Issue") {
            setActiveIssue(event.active.data.current.issue);
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveIssue = active.data.current?.type === "Issue";
        const isOverIssue = over.data.current?.type === "Issue";

        if (!isActiveIssue) return;

        // Drop over another issue
        if (isActiveIssue && isOverIssue) {
            setIssues((issues) => {
                const activeIndex = issues.findIndex((i) => (i._id as unknown as string) === activeId);
                const overIndex = issues.findIndex((i) => (i._id as unknown as string) === overId);

                if (activeIndex === -1 || overIndex === -1) return issues;

                if (issues[activeIndex].status !== issues[overIndex].status) {
                    issues[activeIndex].status = issues[overIndex].status;
                }

                return arrayMove(issues, activeIndex, overIndex);
            });
        }

        // Drop over a column
        const isOverColumn = over.data.current?.type === "Column";
        if (isActiveIssue && isOverColumn) {
            setIssues((issues) => {
                const activeIndex = issues.findIndex((i) => (i._id as unknown as string) === activeId);
                if (activeIndex !== -1 && issues[activeIndex].status !== overId) {
                    issues[activeIndex].status = overId as string;
                    return [...issues];
                }
                return issues;
            });
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveIssue(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;

        // Find result status from our optimistic state
        const currentIssueState = issues.find(i => (i._id as unknown as string) === activeId);

        if (currentIssueState) {
            const targetStatus = currentIssueState.status;
            // Get all issues in that column in correct order
            const targetIssues = issues.filter(i => i.status === targetStatus);

            const updates = targetIssues.map((issue, index) => ({
                id: issue._id as unknown as string,
                order: index,
                status: targetStatus
            }));

            updateIssueOrder(updates, project._id as unknown as string);
        }
    }

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex h-full gap-6 p-4 overflow-x-auto">
                {project.statuses.map((status) => (
                    <BoardColumn
                        key={status.id}
                        status={status}
                        issues={issues.filter((i) => i.status === status.id)}
                        projectId={project._id as unknown as string}
                        allStatuses={project.statuses}
                    />
                ))}
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeIssue && <BoardCard issue={activeIssue} />}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
