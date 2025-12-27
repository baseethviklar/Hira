import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    // Debug: Check if secret is available
    console.log("DEBUG: Middleware Config", {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        secretBufferLength: process.env.NEXTAUTH_SECRET?.length,
    });

    // Try standard token retrieval
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If failed, try explicitly forcing the cookie name seen in Vercel logs
    if (!token) {
        console.log("DEBUG: Standard getToken failed. Trying explicit cookie name...");
        token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: "__Secure-next-auth.session-token"
        });
    }

    const { pathname } = req.nextUrl;

    console.log("DEBUG: Middleware Manual Check", {
        path: pathname,
        hasToken: !!token,
        cookies: req.cookies.getAll().map(c => c.name),
    });

    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isProtectedRoute = pathname.startsWith("/projects") || pathname.startsWith("/workspace");

    if (isProtectedRoute && !token) {
        console.log("DEBUG: Redirecting to login (No Token)");
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
    }

    if (isAuthRoute && token) {
        console.log("DEBUG: Redirecting to projects (Already Authenticated)");
        return NextResponse.redirect(new URL("/projects", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/projects/:path*", "/workspace/:path*", "/login", "/register"],
};
