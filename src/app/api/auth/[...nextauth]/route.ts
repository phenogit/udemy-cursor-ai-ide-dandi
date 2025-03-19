import NextAuth from "next-auth";
import { authOptions } from "./auth";

const handler = NextAuth(authOptions);

// Export GET and POST handlers separately
export const GET = handler;
export const POST = handler;
