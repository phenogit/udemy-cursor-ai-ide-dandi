import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";

export async function GET(request: NextRequest, { params }: any) {
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

    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("id", params.id)
        .eq("email", session.user.email)
        .single();

      if (error) {
        console.error("Error fetching API key:", error);
        return NextResponse.json(
          { error: "API key not found or unauthorized" },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      console.error("Supabase client error:", supabaseError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in GET /api/api-keys/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: any) {
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
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    try {
      const supabase = await createClient();

      // Update API key name, ensuring the key belongs to the user
      const { data, error } = await supabase
        .from("api_keys")
        .update({ name })
        .eq("id", params.id)
        .eq("email", session.user.email) // Ensure the key belongs to the user
        .select()
        .single();

      if (error) {
        console.error("Error updating API key:", error);
        return NextResponse.json(
          { error: "Failed to update API key: " + error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "API key not found or unauthorized" },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      console.error("Supabase client error:", supabaseError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in PATCH /api/api-keys/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
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

    try {
      const supabase = await createClient();

      // Delete API key, ensuring it belongs to the user
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", params.id)
        .eq("email", session.user.email); // Ensure the key belongs to the user

      if (error) {
        console.error("Error deleting API key:", error);
        return NextResponse.json(
          { error: "Failed to delete API key: " + error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "API key deleted successfully" });
    } catch (supabaseError) {
      console.error("Supabase client error:", supabaseError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in DELETE /api/api-keys/[id]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
