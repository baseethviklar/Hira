"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-background px-4 relative cursor-pointer" // Add cursor-pointer to indicate clickable
            onClick={() => router.push("/")}
        >
            <Button
                variant="ghost"
                className="absolute top-4 left-4 md:top-8 md:left-8"
                onClick={(e) => {
                    e.stopPropagation();
                    router.push("/");
                }}
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            {/* Wrap children in a div that stops propagation so clicking the form doesn't navigate away */}
            <div onClick={(e) => e.stopPropagation()} className="cursor-default w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
