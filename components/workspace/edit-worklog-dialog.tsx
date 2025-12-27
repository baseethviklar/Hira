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
import { updateWorklog, deleteWorklog } from "@/lib/actions/time-tracking";
import { toast } from "sonner";
import { useState } from "react";
import { formatDuration, parseDuration } from "@/lib/format-time";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const formSchema = z.object({
    timeSpent: z.string().min(1, "Time spent is required (e.g. 1h 30m)"),
    description: z.string().optional(),
});

interface EditWorklogDialogProps {
    issueId: string;
    worklogId: string;
    initialTimeSpent: number;
    initialDescription?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditWorklogDialog({
    issueId,
    worklogId,
    initialTimeSpent,
    initialDescription,
    open,
    onOpenChange
}: EditWorklogDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            timeSpent: formatDuration(initialTimeSpent),
            description: initialDescription || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const minutes = parseDuration(values.timeSpent);
            if (minutes <= 0) {
                form.setError("timeSpent", { message: "Invalid duration format" });
                return;
            }

            await updateWorklog(issueId, worklogId, { timeSpent: minutes, description: values.description });
            toast.success("Worklog updated");
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update worklog");
        } finally {
            setIsLoading(false);
        }
    }

    async function onDelete() {
        setIsLoading(true);
        try {
            await deleteWorklog(issueId, worklogId);
            toast.success("Worklog deleted");
            setDeleteOpen(false);
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete worklog");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Work Log</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            <DialogFooter className="flex justify-between sm:justify-between">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setDeleteOpen(true)}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex gap-2">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isLoading}>
                                        Save Changes
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this work log?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the work log and add the time back to the remaining estimate. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
