import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            console.log("Middleware Authorized Check:", {
                path: req.nextUrl.pathname,
                hasToken: !!token,
                tokenSub: token?.sub
            });
            return !!token;
        },
    },
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: ["/projects/:path*", "/workspace/:path*"],
};
