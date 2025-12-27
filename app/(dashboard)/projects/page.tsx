import { getProjects } from "@/lib/actions/project";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

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
                    <Link href={`/projects/${project._id}`} key={project._id}>
                        <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between space-x-2">
                                    <CardTitle className="text-lg">{project.name}</CardTitle>
                                    <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{project.key}</span>
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
