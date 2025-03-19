import { supabase } from "@/utils/supabase";
import { summarizeReadme } from "./chain";

/**
 * Checks and updates rate limiting for an API key
 * @param {string} apiKey - The API key to check
 * @returns {Promise<{ isLimited: boolean, error?: string, keyData?: any, headers: HeadersInit }>}
 */
async function checkRateLimit(apiKey) {
  if (!apiKey) {
    return {
      isLimited: true,
      error: "API key is required",
      headers: { "Content-Type": "application/json" },
      status: 401,
    };
  }

  // Validate API key and check rate limit
  const { data: keyData, error: keyError } = await supabase
    .from("api_keys")
    .select("id, usage, rate_limit")
    .eq("key", apiKey)
    .single();

  // Handle invalid API key
  if (keyError?.code === "PGRST116") {
    return {
      isLimited: true,
      error: "Invalid API key",
      headers: { "Content-Type": "application/json" },
      status: 401,
    };
  }

  // Handle other database errors
  if (keyError) {
    console.error("Supabase error:", keyError);
    return {
      isLimited: true,
      error: "Error validating API key",
      headers: { "Content-Type": "application/json" },
      status: 500,
    };
  }

  const rateLimitHeaders = {
    "Content-Type": "application/json",
    "X-RateLimit-Limit": keyData.rate_limit.toString(),
    "X-RateLimit-Remaining": (keyData.rate_limit - keyData.usage).toString(),
  };

  // Check if rate limit is exceeded
  if (keyData.usage >= keyData.rate_limit) {
    return {
      isLimited: true,
      error: "Rate limit exceeded",
      keyData,
      headers: rateLimitHeaders,
      status: 429,
    };
  }

  // Increment usage counter
  const { error: updateError } = await supabase
    .from("api_keys")
    .update({ usage: keyData.usage + 1 })
    .eq("id", keyData.id);

  if (updateError) {
    console.error("Error updating usage count:", updateError);
    // Continue despite update error
  }

  return {
    isLimited: false,
    keyData,
    headers: {
      ...rateLimitHeaders,
      "X-RateLimit-Remaining": (
        keyData.rate_limit -
        (keyData.usage + 1)
      ).toString(),
    },
  };
}

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

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(apiKey);

    if (rateLimitResult.isLimited) {
      return new Response(
        JSON.stringify({
          error: rateLimitResult.error,
          usage: rateLimitResult.keyData?.usage,
          limit: rateLimitResult.keyData?.rate_limit,
        }),
        {
          status: rateLimitResult.status,
          headers: rateLimitResult.headers,
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
        headers: rateLimitResult.headers,
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
