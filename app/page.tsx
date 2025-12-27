import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/projects");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white dark:bg-slate-950">
        <span className="font-bold text-lg">Hira Lite</span>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 flex items-center">
            Sign In
          </Link>
          <Link href="/register">
            <Button size="sm">Sign Up</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent pb-2">
          Manage your projects with ease.
        </h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mt-6 leading-relaxed">
          The simplest way to track your tasks, bugs, and stories. <br className="hidden sm:inline" />
          Kanban boards, instant updates, and no clutter.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <Button size="lg" className="h-12 px-8 text-lg">Get Started for Free</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">Log In</Button>
          </Link>
        </div>
      </main>
      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t text-center text-sm text-gray-500">
        © 2024 Hira Lite. Built with Next.js & MongoDB.
      </footer>
    </div>
  );
}
