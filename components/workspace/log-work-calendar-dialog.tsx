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
    DialogDescription,
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
import { logWork } from "@/lib/actions/time-tracking";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { parseDuration } from "@/lib/format-time";
import { IIssue } from "@/lib/models/Issue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const formSchema = z.object({
    issueId: z.string().min(1, "Please select an issue"),
    timeSpent: z.string().min(1, "Time spent is required (e.g. 1h 30m)"),
    description: z.string().optional(),
});

interface LogWorkCalendarDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date | null;
    issues: IIssue[];
    onSuccess?: () => void;
}

export function LogWorkCalendarDialog({ open, onOpenChange, date, issues, onSuccess }: LogWorkCalendarDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            issueId: "",
            timeSpent: "",
            description: "",
        },
    });

    // Reset form when dialog opens or date changes
    useEffect(() => {
        if (open) {
            form.reset({
                issueId: "",
                timeSpent: "",
                description: "",
            });
        }
    }, [open, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const minutes = parseDuration(values.timeSpent);
            if (minutes <= 0) {
                form.setError("timeSpent", { message: "Invalid duration format" });
                return;
            }

            if (!date) return;

            // Log work for the specific date selected
            await logWork(values.issueId, {
                timeSpent: minutes,
                description: values.description,
                date: date
            });

            toast.success("Work logged successfully");
            onOpenChange(false);
            onSuccess?.();
            // Force refresh? The parent might need to trigger this. 
            // In Server Actions, revalidatePath in the action handles data consistency.
        } catch (error) {
            toast.error("Failed to log work");
        } finally {
            setIsLoading(false);
        }
    }

    if (!date) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Work - {format(date, "MMM d, yyyy")}</DialogTitle>
                    <DialogDescription>
                        Select an issue assigned to this date to log your hours.
                    </DialogDescription>
                </DialogHeader>

                {issues.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                        No issues assigned to this date.
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="issueId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Issue</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an issue..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {issues.map((issue) => (
                                                    <SelectItem key={issue._id as unknown as string} value={issue._id as unknown as string}>
                                                        {issue.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="timeSpent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time Spent</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 2h 30m or 90m" {...field} />
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
                                        <FormLabel>Work Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="What did you work on?" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isLoading}>
                                    Log Work
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
