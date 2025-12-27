import { getProjects } from "@/lib/actions/project";
import { getSpaces } from "@/lib/actions/space";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateSpaceDialog } from "@/components/spaces/create-space-dialog";
import { SpaceCard } from "@/components/spaces/space-card";
import { Separator } from "@/components/ui/separator";

export default async function ProjectsPage() {
    const projects = await getProjects();
    const spaces = await getSpaces();

    // Filter projects that do not have a spaceId (Standalone)
    const standaloneProjects = projects.filter((p: any) => !p.spaceId);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
                    <p className="text-muted-foreground mt-1">Manage your spaces and projects.</p>
                </div>
                <div className="flex gap-2">
                    <CreateSpaceDialog />
                    <CreateProjectDialog />
                </div>
            </div>

            {/* Spaces Section */}
            {spaces.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold tracking-tight text-muted-foreground flex items-center">
                        Your Spaces
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {spaces.map((space: any) => (
                            <SpaceCard key={space._id} space={space} />
                        ))}
                    </div>
                    <Separator className="my-6" />
                </div>
            )}

            {/* Standalone Projects Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight text-muted-foreground flex items-center">
                    {spaces.length > 0 ? "Standalone Projects" : "Projects"}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {standaloneProjects.map((project: any) => (
                        <ProjectCard key={project._id} project={project} spaces={spaces} />
                    ))}
                    {standaloneProjects.length === 0 && (
                        <div className="col-span-full text-center p-8 border border-dashed rounded-lg text-muted-foreground bg-accent/20">
                            {spaces.length > 0 ? "No standalone projects." : "No projects found. Create one to get started."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
