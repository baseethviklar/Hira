"use client";


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateIssueDetails, deleteIssue } from "@/lib/actions/issue";
import { toast } from "sonner";
import { IIssue } from "@/lib/models/Issue";
import { useState } from "react";
import { Trash2, Clock, CalendarIcon } from "lucide-react";
import { LogWorkDialog } from "./log-work-dialog";
import { formatDuration, parseDuration } from "@/lib/format-time";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    type: z.enum(["TASK", "BUG", "STORY"]),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    originalEstimate: z.string().optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
    }
    return true;
}, {
    message: "End date cannot be before start date",
    path: ["endDate"],
});

interface EditIssueDialogProps {
    issue: IIssue;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditIssueDialog({ issue, open, onOpenChange }: EditIssueDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [logWorkOpen, setLogWorkOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: issue.title,
            description: issue.description || "",
            priority: issue.priority as "LOW" | "MEDIUM" | "HIGH",
            type: issue.type as "TASK" | "BUG" | "STORY",
            startDate: issue.startDate ? new Date(issue.startDate) : undefined,
            endDate: issue.endDate ? new Date(issue.endDate) : undefined,
            originalEstimate: issue.originalEstimate ? formatDuration(issue.originalEstimate) : "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const estimateMinutes = values.originalEstimate ? parseDuration(values.originalEstimate) : undefined;

            await updateIssueDetails(issue._id as unknown as string, {
                ...values,
                originalEstimate: estimateMinutes
            });
            toast.success("Issue updated");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update issue");
        } finally {
            setIsLoading(false);
        }
    }

    async function onDelete() {
        if (!confirm("Are you sure you want to delete this issue?")) return;

        setIsLoading(true);
        try {
            await deleteIssue(issue._id as unknown as string);
            toast.success("Issue deleted");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to delete issue");
        } finally {
            setIsLoading(false);
        }
    }

    // Calculate progress
    const total = (issue.originalEstimate || 0);
    const spent = (issue.timeSpent || 0);
    const progress = total > 0 ? Math.min((spent / total) * 100, 100) : 0;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Issue</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Issue title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Details..." className="min-h-[100px]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LOW">Low</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                                    <SelectItem value="HIGH">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="TASK">Task</SelectItem>
                                                    <SelectItem value="BUG">Bug</SelectItem>
                                                    <SelectItem value="STORY">Story</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date: Date) => {
                                                            const endDate = form.getValues("endDate");
                                                            return date < new Date("1900-01-01") || (endDate ? date > endDate : false);
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date: Date) => {
                                                            const startDate = form.getValues("startDate");
                                                            return date < new Date("1900-01-01") || (startDate ? date < startDate : false);
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="originalEstimate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Original Estimate</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 2h 30m" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Time Tracking Section */}
                            <div className="space-y-2 border-t pt-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Time Tracking
                                    </h4>
                                    <Button variant="ghost" size="sm" onClick={() => setLogWorkOpen(true)} type="button">
                                        + Log Work
                                    </Button>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{formatDuration(spent)} logged</span>
                                        <span>{formatDuration(issue.remainingEstimate || 0)} remaining</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                    <div className="flex justify-end text-xs text-muted-foreground">
                                        <span>Original Estimate: {formatDuration(issue.originalEstimate || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="flex justify-between sm:justify-between pt-4">
                                <Button type="button" variant="destructive" size="icon" onClick={onDelete} disabled={isLoading}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex gap-2">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <LogWorkDialog
                issueId={issue._id as unknown as string}
                open={logWorkOpen}
                onOpenChange={setLogWorkOpen}
                onSuccess={() => {
                    // In a real app we might refetch, but Server Actions + revalidatePath should handle board updates.
                    // However, we might need to close this dialog or force a refresh to see the new stats immediately inside this dialog?
                    // Since this dialog is controlled by the parent, and issue is passed as prop, 
                    // the parent (BoardCard) holds the issue data. 
                    // revalidatePath updates the page data, but client components might need to be refreshed.
                    // For now, let's assume the user will close and reopen to see exact changes or we rely on Next.js Router refresh.
                    onOpenChange(false); // Close the edit dialog to force refresh when reopened or let user see board update.
                }}
            />
        </>
    );
}
