import { getSpace } from "@/lib/actions/space";
import { getProjects } from "@/lib/actions/project";
import { notFound } from "next/navigation";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Folder } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface SpacePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function SpacePage({ params }: SpacePageProps) {
    const { id } = await params;
    const space = await getSpace(id);

    if (!space) {
        notFound();
    }

    const projects = await getProjects(id);
    // Needed to allow moving projects OUT of this space or TO another space from here
    const { getSpaces } = await import("@/lib/actions/space");
    const allSpaces = await getSpaces();

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Link href="/projects">
                    <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Workspaces
                    </Button>
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Folder className="h-8 w-8 text-blue-500" />
                            {space.name}
                        </h1>
                        {space.description && (
                            <p className="text-muted-foreground">{space.description}</p>
                        )}
                    </div>
                    <CreateProjectDialog spaceId={id} />
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Projects in {space.name}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project: any) => (
                        <ProjectCard key={project._id} project={project} spaces={allSpaces} />
                    ))}
                    {projects.length === 0 && (
                        <div className="col-span-full text-center p-12 text-muted-foreground bg-accent/20 rounded-lg border border-dashed">
                            No projects in this space yet. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
