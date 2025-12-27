"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IIssue } from "@/lib/models/Issue";
import Link from "next/link";

interface WorkspaceCalendarProps {
    issues: IIssue[];
}

import { LogWorkCalendarDialog } from "./log-work-calendar-dialog";

export function WorkspaceCalendar({ issues }: WorkspaceCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dialogState, setDialogState] = useState<{ open: boolean; date: Date | null; issues: IIssue[] }>({
        open: false,
        date: null,
        issues: [],
    });

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));

    const totalDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const resetToday = () => setCurrentMonth(new Date());

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <Button variant="outline" size="sm" onClick={resetToday}>Today</Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="bg-background p-2 text-center text-sm font-medium">
                        {day}
                    </div>
                ))}

                {totalDays.map((day, dayIdx) => {
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    // Find issues active on this day
                    const daysIssues = issues.filter(issue => {
                        if (!issue.startDate) return false;
                        // Use endDate or default to startDate if strictly one day? 
                        // User said "start date and end date".
                        // If no endDate, assume single day task.
                        const start = new Date(issue.startDate);
                        const end = issue.endDate ? new Date(issue.endDate) : start;

                        // Strip time for accurate day comparison
                        const checkStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                        const checkEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                        const checkDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());

                        return checkDay >= checkStart && checkDay <= checkEnd;
                    });

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => setDialogState({ open: true, date: day, issues: daysIssues })}
                            className={cn(
                                "bg-background min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-muted/50 cursor-pointer",
                                !isCurrentMonth && "bg-muted/30 text-muted-foreground"
                            )}
                        >
                            <div className={cn(
                                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                isToday && "bg-primary text-primary-foreground"
                            )}>
                                {format(day, "d")}
                            </div>

                            <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                                {daysIssues.map(issue => (
                                    <Link
                                        key={issue._id as unknown as string}
                                        href={`/projects/${issue.projectId}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className={cn(
                                            "text-xs px-2 py-1 rounded truncate border font-medium",
                                            issue.priority === "HIGH" ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" :
                                                issue.priority === "MEDIUM" ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" :
                                                    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                                        )}>
                                            {issue.title}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <LogWorkCalendarDialog
                open={dialogState.open}
                onOpenChange={(open) => setDialogState(prev => ({ ...prev, open }))}
                date={dialogState.date}
                issues={dialogState.issues}
            />
        </Card >
    );
}
