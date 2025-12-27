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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists
import { Label } from "@/components/ui/label"; // Assuming Label exists or use Form

interface SpaceCardProps {
    space: any;
}

export function SpaceCard({ space }: SpaceCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [name, setName] = useState(space.name);
    const [description, setDescription] = useState(space.description || "");

    async function onDelete() {
        if (!confirm("Are you sure? All projects inside will become standalone.")) return;
        setIsLoading(true);
        try {
            await deleteSpace(space._id);
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
                                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
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
        </>
    );
}
