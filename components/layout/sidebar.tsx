"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase } from "lucide-react";
import Image from "next/image";

const routes = [
    {
        label: "Projects",
        icon: LayoutDashboard,
        href: "/projects",
    },
    {
        label: "My Workspace",
        icon: Briefcase,
        href: "/workspace",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white w-full dark:bg-slate-950 border-r border-slate-800">
            <div className="px-3 py-2">
                <Link href="/projects" className="flex items-center pl-3 mb-14">
                    <div className="relative w-32 h-10">
                        <Image
                            src="/HiraNew.png"
                            alt="Hira Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname.startsWith(route.href) ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className="h-5 w-5 mr-3" />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
