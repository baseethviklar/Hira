import { getProject } from "@/lib/actions/project";
import { getIssues } from "@/lib/actions/issue";
import { KanbanBoard } from "@/components/board/kanban-board";
import { notFound } from "next/navigation";
import { CreateIssueDialog } from "@/components/board/create-issue-dialog";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [project, issues] = await Promise.all([
        getProject(id),
        getIssues(id),
    ]);

    if (!project) {
        notFound();
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 px-4 pt-4">
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <p className="text-sm text-muted-foreground">{project.key} board</p>
                </div>
                <CreateIssueDialog projectId={project._id as unknown as string} statuses={project.statuses} />
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <KanbanBoard project={project} initialIssues={issues} />
            </div>
        </div>
    );
}
