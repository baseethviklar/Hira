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
import { logWork } from "@/lib/actions/time-tracking";
import { toast } from "sonner";
import { useState } from "react";
import { parseDuration } from "@/lib/format-time";

const formSchema = z.object({
    timeSpent: z.string().min(1, "Time spent is required (e.g. 1h 30m)"),
    description: z.string().optional(),
});

interface LogWorkDialogProps {
    issueId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function LogWorkDialog({ issueId, open, onOpenChange, onSuccess }: LogWorkDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            timeSpent: "",
            description: "",
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

            await logWork(issueId, { timeSpent: minutes, description: values.description });
            toast.success("Work logged successfully");
            form.reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error("Failed to log work");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Work</DialogTitle>
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
            </DialogContent>
        </Dialog>
    );
}
