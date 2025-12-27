import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    // Try standard token retrieval
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // If failed, try explicitly forcing the secure cookie name (Vercel/Production fix)
    if (!token) {
        token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: "__Secure-next-auth.session-token"
        });
    }

    const { pathname } = req.nextUrl;
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isProtectedRoute = pathname.startsWith("/projects") || pathname.startsWith("/workspace");

    // Redirect to login if accessing protected route without token
    if (isProtectedRoute && !token) {
        const url = new URL("/login", req.url);
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
    }

    // Redirect to projects if accessing auth route with token
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL("/projects", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/projects/:path*", "/workspace/:path*", "/login", "/register"],
};
