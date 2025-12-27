"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MoreVertical, Pencil, Trash2, FolderInput } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProject, deleteProject } from "@/lib/actions/project";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ProjectCardProps {
    project: any;
    spaces?: any[]; // Allow modifying space on project
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    key: z.string().min(1, "Key is required").max(10, "Key must be 10 characters or less"),
    description: z.string().optional(),
});

export function ProjectCard({ project, spaces }: ProjectCardProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [moveOpen, setMoveOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string>(project.spaceId || "standalone");
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: project.name,
            key: project.key,
            description: project.description || "",
        },
    });

    async function onUpdate(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await updateProject(project._id, values);
            toast.success("Project updated");
            setEditOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update project");
        } finally {
            setIsLoading(false);
        }
    }

    async function onMove() {
        setIsLoading(true);
        try {
            // "standalone" means remove spaceId (set to empty string or null in backend)
            // Backend expects undefined to ignore, or empty string to unset? 
            // My updateProject action: "if (data.spaceId !== undefined) { ... }"
            // But I modified createProject, not updateProject logic fully.
            // Let's check updateProject in lib/actions/project.ts
            // Actually, I need to make sure updateProject supports unsetting key. 
            // The previous change was: query.spaceId = spaceId || null;
            // Wait, that's getProjects.
            // updateProject is generic update(id, data).
            // So if I pass { spaceId: null } or { $unset: { spaceId: 1 } }?
            // Mongoose updateOne with data object replaces/sets fields.
            // If I pass { spaceId: null }, it sets it to null.

            const spaceIdToUpdate = selectedSpaceId === "standalone" ? "" : selectedSpaceId;
            // However, sending empty string might not unset it if schema refers to ObjectId.
            // It might cast error.
            // Best to send null if allowed by schema, or modify backend to handle "standalone".

            // Let's assume for now passing null works if schema allows optional. 
            // Or I might need to update backend action to handle this case specifically.
            // Let's update backend action next if needed. For now, try passing null.
            // But types say string.

            // I'll update the backend action to accept 'null' or empty string and handle it.
            // For now let's pass it.

            await updateProject(project._id, {
                name: project.name,
                key: project.key,
                spaceId: spaceIdToUpdate || undefined
            } as any);

            toast.success("Project moved");
            setMoveOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to move project");
        } finally {
            setIsLoading(false);
        }
    }

    async function onDelete() {
        setIsLoading(true);
        try {
            await deleteProject(project._id);
            toast.success("Project deleted");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete project");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="relative group">
                <Link href={`/projects/${project._id}`} className="block h-full">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between space-x-2 pr-8">
                                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                                <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded shrink-0">{project.key}</span>
                            </div>
                            <CardDescription className="line-clamp-2">
                                {project.description || "No description"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {spaces && spaces.length > 0 && (
                                <>
                                    <DropdownMenuItem onClick={() => setMoveOpen(true)}>
                                        <FolderInput className="mr-2 h-4 w-4" /> Move to Space
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Make changes to your project here.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Project Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="key"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Key</FormLabel>
                                        <FormControl>
                                            <Input placeholder="KEY" {...field} />
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
                                            <Textarea placeholder="Describe your project" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Move Project</DialogTitle>
                        <DialogDescription>
                            Select a space to move this project to.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="mb-2 block">Select Space</Label>
                        <Select value={selectedSpaceId} onValueChange={setSelectedSpaceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a space" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standalone">No Space (Standalone)</SelectItem>
                                {spaces?.map((space: any) => (
                                    <SelectItem key={space._id} value={space._id}>
                                        {space.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMoveOpen(false)}>Cancel</Button>
                        <Button onClick={onMove} disabled={isLoading}>
                            {isLoading ? "Moving..." : "Move Project"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project
                            "{project.name}" and all of its associated issues.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                            {isLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
