import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "ADMIN") {
            return NextResponse.rewrite(new URL("/login", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        secret: "super-secret-key-altim-2025",
    }
);

export const config = { matcher: ["/admin/:path*"] };
