import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@/utils/supabase/server";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const supabase = await createClient();

          // Check if user exists
          const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          if (!existingUser) {
            // Create new user if doesn't exist
            const { error } = await supabase.from("users").insert([
              {
                email: user.email,
                name: user.name || "",
                image: user.image,
                provider: account.provider,
                provider_account_id: account.providerAccountId,
              },
            ]);

            if (error) {
              console.error("Error creating user in Supabase:", error);
              return false;
            }
          }
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} as const;
