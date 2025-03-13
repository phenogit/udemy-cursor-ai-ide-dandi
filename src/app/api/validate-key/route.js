import { supabase } from "@/utils/supabase";

export async function POST(request) {
  try {
    const { apiKey } = await request.json();

    // Query Supabase to check if the API key exists
    const { data, error } = await supabase
      .from("api_keys")
      .select("id")
      .eq("key", apiKey)
      .single();

    // Handle the case where no matching key is found
    if (error?.code === "PGRST116") {
      return new Response(JSON.stringify({ valid: false }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle other potential errors
    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({ error: "Error validating API key" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If we found data, the key is valid
    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Request error:", error);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
