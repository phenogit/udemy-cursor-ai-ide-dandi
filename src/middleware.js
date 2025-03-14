import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Only protect direct access to /dashboard routes
      if (req.nextUrl.pathname.startsWith("/dashboard")) {
        // If there's no token, the middleware will redirect to sign-in
        return !!token;
      }
      return true;
    },
  },
  pages: {
    // Customize the sign-in page URL
    signIn: "/auth/signin",
  },
});

// Protect all routes under /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
