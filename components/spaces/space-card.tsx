"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, MoreVertical, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSpace, updateSpace } from "@/lib/actions/space";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists
import { Label } from "@/components/ui/label"; // Assuming Label exists or use Form

interface SpaceCardProps {
    space: any;
    projectCount?: number;
}

export function SpaceCard({ space, projectCount = 0 }: SpaceCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [name, setName] = useState(space.name);
    const [description, setDescription] = useState(space.description || "");
    const [deleteProjects, setDeleteProjects] = useState(false); // New state for delete option

    async function onDelete() {
        setIsLoading(true);
        try {
            await deleteSpace(space._id, { deleteProjects }); // Pass option
            toast.success("Space deleted");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete space");
        } finally {
            setIsLoading(false);
        }
    }

    async function onUpdate() {
        setIsLoading(true);
        try {
            await updateSpace(space._id, { name, description });
            toast.success("Space updated");
            setEditOpen(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update space");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Link href={`/spaces/${space._id}`} className="block h-full">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Folder className="mr-2 h-4 w-4 text-blue-500" />
                            {space.name}
                        </CardTitle>
                        <div onClick={(e) => e.preventDefault()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground truncate">
                            {space.description || "No description"}
                        </p>
                    </CardContent>
                </Card>
            </Link>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Space</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={onUpdate} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the space
                            "{space.name}".
                        </AlertDialogDescription>
                        <div className="pt-4 space-y-3 text-sm text-foreground">
                            {projectCount > 0 && (
                                <RadioGroup defaultValue="keep" onValueChange={(val) => setDeleteProjects(val === "delete")}>
                                    <div className="flex items-start space-x-2">
                                        <RadioGroupItem value="keep" id="keep" className="mt-1" />
                                        <Label htmlFor="keep" className="grid gap-1.5 leading-none cursor-pointer">
                                            <span className="font-medium">Keep {projectCount} project{projectCount > 1 ? 's' : ''} as standalone</span>
                                            <span className="text-muted-foreground text-xs">Projects will be moved to the main dashboard.</span>
                                        </Label>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <RadioGroupItem value="delete" id="delete" className="mt-1" />
                                        <Label htmlFor="delete" className="grid gap-1.5 leading-none cursor-pointer">
                                            <span className="font-medium text-destructive">Delete all projects</span>
                                            <span className="text-muted-foreground text-xs">Projects and their issues will be permanently deleted.</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                            {projectCount === 0 && (
                                <p className="text-muted-foreground italic">This space is empty.</p>
                            )}
                        </div>
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
