import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/feed",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/verify-email"];
      const authRoutes = ["/login", "/register", "/forgot-password"];
      const adminRoutes = ["/admin"];

      const pathname = nextUrl.pathname;
      const isPublicRoute =
        publicRoutes.some((route) => pathname === route) ||
        pathname.startsWith("/api/auth");
      const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
      const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/feed", nextUrl));
      }

      if (!isPublicRoute && !isLoggedIn) {
        const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
        return Response.redirect(
          new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
        );
      }

      if (isAdminRoute && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/feed", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
