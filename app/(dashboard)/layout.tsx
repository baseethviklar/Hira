import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <div className="hidden md:flex w-64 flex-col border-r bg-background">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    ); // Adjusted for better scrolling behavior
}
