import { supabase } from "@/utils/supabase";
import { summarizeReadme } from "./chain";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}

export async function POST(request) {
  try {
    const { githubUrl } = await request.json();
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate API key first
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("id")
      .eq("key", apiKey)
      .single();

    // Handle the case where no matching key is found
    if (keyError?.code === "PGRST116") {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid API key" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle other potential errors with API key validation
    if (keyError) {
      console.error("Supabase error:", keyError);
      return new Response(
        JSON.stringify({ error: "Error validating API key" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const readmeContent = await getGitHubReadme(githubUrl);
    console.log(readmeContent);
    const summary = await summarizeReadme(readmeContent);
    console.log(summary);

    return new Response(
      JSON.stringify({
        valid: true,
        summary: summary,
        githubUrl: githubUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Request error:", error);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function getGitHubReadme(githubUrl) {
  try {
    // Parse the GitHub URL to extract owner and repo
    const urlParts = githubUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];

    // Construct the raw content URL for README.md
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;

    // Fetch the README content
    const response = await fetch(readmeUrl);

    if (!response.ok) {
      // Try fallback to master branch if main doesn't exist
      const fallbackUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
      const fallbackResponse = await fetch(fallbackUrl);

      if (!fallbackResponse.ok) {
        throw new Error("README not found in main or master branch");
      }

      return await fallbackResponse.text();
    }

    return await response.text();
  } catch (error) {
    console.error("Error fetching GitHub README:", error);
    throw error;
  }
}
