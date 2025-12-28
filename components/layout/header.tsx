import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
    spaces: any[];
    projects: any[];
}

export function Header({ spaces, projects }: HeaderProps) {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                {/* Mobile Sidebar Trigger */}
                <div className="md:hidden mr-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800 w-72">
                            <Sidebar spaces={spaces} projects={projects} />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    <ThemeToggle />
                    <UserNav />
                </div>
            </div>
        </div>
    );
}
