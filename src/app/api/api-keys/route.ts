import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";

interface UserData {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.email) {
      console.error("No email in session:", session);
      return NextResponse.json(
        { error: "No email in session" },
        { status: 400 }
      );
    }

    console.log("Session found:", session.user.email);

    try {
      const supabase = await createClient();

      // Fetch API keys directly by email
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("email", session.user.email)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching API keys:", error);
        return NextResponse.json(
          { error: "Error fetching API keys: " + error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(data || []);
    } catch (supabaseError) {
      console.error("Supabase client error:", supabaseError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in GET /api/api-keys:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.email) {
      return NextResponse.json(
        { error: "No email in session" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, key, maskedKey, usage = 0, rateLimit } = body;

    try {
      const supabase = await createClient();

      // Create new API key with email
      const { data, error } = await supabase
        .from("api_keys")
        .insert([
          {
            name,
            key,
            masked_key: maskedKey,
            usage,
            rate_limit: rateLimit,
            email: session.user.email,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating API key:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 201 });
    } catch (supabaseError) {
      console.error("Supabase client error:", supabaseError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in POST /api/api-keys:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
