import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getSpaces } from "@/lib/actions/space";
import { getProjects } from "@/lib/actions/project";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [spaces, projects] = await Promise.all([
        getSpaces(),
        getProjects()
    ]);

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="hidden md:flex w-64 flex-col border-r bg-background">
                <Sidebar spaces={spaces} projects={projects} />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header spaces={spaces} projects={projects} />
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
}
