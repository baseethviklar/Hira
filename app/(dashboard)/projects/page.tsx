import { getProjects } from "@/lib/actions/project";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";

export default async function ProjectsPage() {
    const projects = await getProjects();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <CreateProjectDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project: any) => (
                    <ProjectCard key={project._id} project={project} />
                ))}
                {projects.length === 0 && (
                    <div className="col-span-full text-center p-12 text-muted-foreground">
                        No projects found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
