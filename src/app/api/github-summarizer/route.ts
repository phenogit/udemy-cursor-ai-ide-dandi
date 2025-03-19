import { supabase } from "@/utils/supabase";
import { summarizeReadme } from "./chain";
import { getGitHubData } from "./github";
import { NextResponse } from "next/server";

interface RateLimitResult {
  isLimited: boolean;
  error?: string;
  keyData?: {
    usage: number;
    rate_limit: number;
  };
  headers: HeadersInit;
  status?: number;
}

/**
 * Checks and updates rate limiting for an API key
 * @param apiKey - The API key to check
 */
async function checkRateLimit(apiKey: string | null): Promise<RateLimitResult> {
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

export async function POST(request: Request) {
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

    const { readmeContent, stars, latestVersion, websiteUrl, license } =
      await getGitHubData(githubUrl);
    console.log(readmeContent);
    const summary = await summarizeReadme(readmeContent);
    console.log(summary);

    return new Response(
      JSON.stringify({
        valid: true,
        summary: summary,
        githubUrl: githubUrl,
        stars: stars,
        latestVersion: latestVersion,
        websiteUrl: websiteUrl,
        license: license,
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
