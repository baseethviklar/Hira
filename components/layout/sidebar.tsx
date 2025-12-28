"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, LogOut, Home, Folder, ChevronRight, ChevronDown, Layers, Plus } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateSpaceDialog } from "@/components/spaces/create-space-dialog";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

// Define minimal interfaces for props
interface SidebarSpace {
    _id: string;
    name: string;
    description?: string;
}

interface SidebarProject {
    _id: string;
    key: string;
    name: string;
    spaceId?: string;
}

interface SidebarProps {
    spaces: SidebarSpace[];
    projects: SidebarProject[];
}

export function Sidebar({ spaces, projects }: SidebarProps) {
    const pathname = usePathname();
    const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({});
    const [isStandaloneExpanded, setIsStandaloneExpanded] = useState(true);

    const toggleSpace = (spaceId: string) => {
        setExpandedSpaces(prev => ({ ...prev, [spaceId]: !prev[spaceId] }));
    };

    // Group projects by space
    const projectsBySpace = projects.reduce((acc, project: SidebarProject) => {
        if (project.spaceId) {
            if (!acc[project.spaceId]) acc[project.spaceId] = [];
            acc[project.spaceId].push(project);
        }
        return acc;
    }, {} as Record<string, any[]>);

    const standaloneProjects = projects.filter(p => !p.spaceId);

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-full dark:bg-slate-950 border-r border-slate-800">
            {/* Logo Area */}
            <div className="px-6 py-6">
                <Link href="/projects" className="block relative w-32 h-8">
                    <Image
                        src="/HiraNew.png"
                        alt="Hira Logo"
                        fill
                        className="object-contain object-left"
                        priority
                    />
                </Link>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">

                {/* Main Nav */}
                <div className="space-y-1">
                    <Link
                        href="/projects"
                        className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            pathname === "/projects"
                                ? "bg-[#077d7d]/10 text-[#077d7d]"
                                : "hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <Home className="w-4 h-4 mr-3" />
                        Home
                    </Link>
                    <Link
                        href="/workspace"
                        className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            pathname === "/workspace"
                                ? "bg-[#077d7d]/10 text-[#077d7d]"
                                : "hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <Briefcase className="w-4 h-4 mr-3" />
                        My Workspace
                    </Link>
                </div>

                {/* Spaces Section */}
                <div className="space-y-1">
                    <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                        <span>Spaces</span>
                        <CreateSpaceDialog>
                            <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent text-slate-500 hover:text-white">
                                <Plus className="w-3 h-3" />
                            </Button>
                        </CreateSpaceDialog>
                    </div>
                    {spaces.map(space => (
                        <div key={space._id}>
                            <div
                                onClick={() => toggleSpace(space._id)}
                                className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors group",
                                    pathname.includes(space._id) ? "text-white" : "hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                {expandedSpaces[space._id] ? (
                                    <ChevronDown className="w-3 h-3 mr-2 text-slate-500 group-hover:text-slate-300" />
                                ) : (
                                    <ChevronRight className="w-3 h-3 mr-2 text-slate-500 group-hover:text-slate-300" />
                                )}
                                <Folder className="w-4 h-4 mr-3 text-slate-400" />
                                <span className="truncate">{space.name}</span>
                            </div>

                            {/* Nested Projects */}
                            {expandedSpaces[space._id] && projectsBySpace[space._id] && (
                                <div className="ml-9 mt-1 space-y-1 border-l border-slate-800 pl-2">
                                    {projectsBySpace[space._id].map((project: SidebarProject) => (
                                        <Link
                                            key={project._id}
                                            href={`/projects/${project._id}`}
                                            className={cn(
                                                "block px-2 py-1.5 text-xs rounded-md transition-colors truncate",
                                                pathname === `/projects/${project._id}`
                                                    ? "text-[#077d7d] bg-[#077d7d]/10"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                            )}
                                        >
                                            {project.name}
                                        </Link>
                                    ))}
                                    {(!projectsBySpace[space._id] || projectsBySpace[space._id].length === 0) && (
                                        <div className="px-2 py-1 text-xs text-slate-600 italic">No projects</div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {spaces.length === 0 && (
                        <div className="px-3 text-xs text-slate-600 italic">No spaces yet</div>
                    )}
                </div>

                {/* Standalone Projects Section */}
                <div className="space-y-1">
                    <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-6 flex items-center justify-between group">
                        <div
                            className="flex items-center cursor-pointer hover:text-white transition-colors"
                            onClick={() => setIsStandaloneExpanded(!isStandaloneExpanded)}
                        >
                            <span>Standalone Projects</span>
                            {isStandaloneExpanded ? (
                                <ChevronDown className="w-3 h-3 ml-2 text-slate-500 group-hover:text-slate-300" />
                            ) : (
                                <ChevronRight className="w-3 h-3 ml-2 text-slate-500 group-hover:text-slate-300" />
                            )}
                        </div>
                        <CreateProjectDialog>
                            <Button variant="ghost" size="icon" className="h-4 w-4 p-0 hover:bg-transparent text-slate-500 hover:text-white">
                                <Plus className="w-3 h-3" />
                            </Button>
                        </CreateProjectDialog>
                    </div>
                    {isStandaloneExpanded && (
                        <>
                            {standaloneProjects.map((project: SidebarProject) => (
                                <Link
                                    key={project._id}
                                    href={`/projects/${project._id}`}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        pathname === `/projects/${project._id}`
                                            ? "bg-[#077d7d]/10 text-[#077d7d]"
                                            : "hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <span className="w-4 h-4 mr-3 flex items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                                        {project.key.substring(0, 1)}
                                    </span>
                                    <span className="truncate">{project.name}</span>
                                </Link>
                            ))}
                            {standaloneProjects.length === 0 && (
                                <div className="px-3 text-xs text-slate-600 italic">No standalone projects</div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 pl-2"
                >
                    <LogOut className="w-4 h-4 mr-3" />
                    Log out
                </Button>
            </div>
        </div>
    );
}
