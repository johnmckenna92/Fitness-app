import { createClient } from "jsr:@supabase/supabase-js@^2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Enforces HTTPS for image URLs to comply with iOS ATS and Android Cleartext security policies.
 */
function enforceHttps(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.startsWith("http://")) {
    return "https://" + trimmed.slice(7);
  }
  if (trimmed.startsWith("//")) {
    return "https:" + trimmed;
  }
  return trimmed;
}

/**
 * Extracts the primary image URL from food.get.v2 or food lookup objects.
 * Checks the food_images array / nested structures and returns secure image_url (or null if empty).
 */
function extractImageUrl(foodObj: any): string | null {
  if (!foodObj) return null;

  let rawUrl: string | null = null;

  // 1. Direct string or direct string fields
  if (typeof foodObj === "string") {
    return enforceHttps(foodObj);
  }
  if (typeof foodObj.image_url === "string" && foodObj.image_url.trim()) {
    rawUrl = foodObj.image_url;
  } else if (typeof foodObj.recipe_image === "string" && foodObj.recipe_image.trim()) {
    rawUrl = foodObj.recipe_image;
  } else if (typeof foodObj.food_image === "string" && foodObj.food_image.trim()) {
    rawUrl = foodObj.food_image;
  }

  // 2. Check direct food_images array or nested object
  if (!rawUrl && foodObj.food_images) {
    if (Array.isArray(foodObj.food_images) && foodObj.food_images.length > 0) {
      const primary = foodObj.food_images[0];
      rawUrl = typeof primary === "string" ? primary : primary?.image_url || primary?.url || primary?.value || null;
    } else if (typeof foodObj.food_images === "object") {
      const nested = foodObj.food_images.food_image;
      if (Array.isArray(nested) && nested.length > 0) {
        const item = nested[0];
        rawUrl = typeof item === "string" ? item : item?.image_url || item?.url || item?.value || null;
      } else if (nested) {
        rawUrl = typeof nested === "string" ? nested : nested.image_url || nested.url || nested.value || null;
      }
    }
  }

  // 3. Check recipe_images
  if (!rawUrl && foodObj.recipe_images) {
    const nested = foodObj.recipe_images.recipe_image || foodObj.recipe_images;
    if (Array.isArray(nested) && nested.length > 0) {
      const item = nested[0];
      rawUrl = typeof item === "string" ? item : item?.image_url || item?.url || item?.value || null;
    } else if (nested) {
      rawUrl = typeof nested === "string" ? nested : nested.image_url || nested.url || nested.value || null;
    }
  }

  // 4. Check images array
  if (!rawUrl && Array.isArray(foodObj.images) && foodObj.images.length > 0) {
    const item = foodObj.images[0];
    rawUrl = typeof item === "string" ? item : item?.image_url || item?.url || null;
  }

  return enforceHttps(rawUrl);
}

Deno.serve(async (req: Request) => {
  // 1. Handle OPTIONS requests immediately to return standard CORS headers
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Global try/catch block ensuring all errors include CORS headers
  try {
    // Securely retrieve FATSECRET credentials
    const clientId = Deno.env.get("FATSECRET_CLIENT_ID");
    const clientSecret = Deno.env.get("FATSECRET_CLIENT_SECRET");
    
    // Setup the Secure Proxy Client
    const proxyUrl = Deno.env.get("FATSECRET_PROXY_URL");
    if (!proxyUrl) {
      throw new Error("Missing FATSECRET_PROXY_URL environment variable. Proxy routing failed.");
    }
    
    // Inject the Deno proxy client
    const proxyClient = Deno.createHttpClient({
      proxy: { url: proxyUrl }
    });

    // Read raw text
    const rawText = await req.text();

    let body: any = {};
    try {
      body = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("JSON Parse Error on incoming body:", parseErr);
    }

    const barcode = body.barcode || body.barcode_number || body.upc || body.gtin;
    const query = body.query || body.search || body.search_expression;
    const foodIdParam = body.food_id || body.foodId;

    if (!barcode && !query && !foodIdParam && !body.method) {
      console.error("Validation failed. Parsed body was:", body);
      return new Response(
        JSON.stringify({
          error: "Missing required 'barcode', 'query', or 'food_id' parameter in request body",
          receivedText: rawText
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Server-Side Rate Limiter via atomic increment_rate_limit RPC (10 requests per 60 seconds)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    let userId: string | null = null;
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: userData, error: authErr } = await supabase.auth.getUser(token || undefined);
    if (!authErr && userData?.user) {
      userId = userData.user.id;
    } else {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userId) {
      const { data: allowed, error: rpcError } = await supabase.rpc(
        "increment_rate_limit",
        {
          p_user_id: userId,
          p_endpoint: "fatsecret-lookup",
          p_limit: 10,
          p_window_seconds: 60,
        }
      );

      if (rpcError) {
        console.error("Rate limit check error:", rpcError);
      } else if (allowed === false) {
        return new Response("Too Many Requests", {
          status: 429,
          headers: corsHeaders,
        });
      }
    }

    // Make POST request to OAuth 2.0 token endpoint routing through the proxy
    const basicAuth = btoa(`${clientId}:${clientSecret}`);
    const tokenUrl = "https://oauth.fatsecret.com/connect/token";

    const tokenParams = new URLSearchParams({
      grant_type: "client_credentials",
      scope: "basic",
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      client: proxyClient, // <-- PROXY ROUTING
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return new Response(
        JSON.stringify({
          error: "Failed to authenticate with FatSecret OAuth 2.0 service",
          status: tokenResponse.status,
          details: errText,
        }),
        {
          status: tokenResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("No access_token returned by FatSecret OAuth endpoint");
    }

    // Strict parameter isolation per method to prevent FatSecret 400 parameter mismatch errors
    let method = body.method;
    if (!method) {
      if (barcode) {
        method = "food.find_id_for_barcode";
      } else if (foodIdParam) {
        method = "food.get.v2";
      } else {
        method = "foods.search";
      }
    }

    const apiParams = new URLSearchParams({
      method,
      format: "json",
    });

    if (method === "food.find_id_for_barcode") {
      apiParams.set("barcode", String(barcode));
    } else if (method === "food.get.v2") {
      apiParams.set("food_id", String(foodIdParam || barcode));
    } else if (method === "foods.search") {
      apiParams.set("search_expression", String(query || ""));
      apiParams.set("max_results", String(body.max_results || 15));
      if (body.page_number !== undefined) {
        apiParams.set("page_number", String(body.page_number));
      }
    } else if (body.params) {
      for (const [k, v] of Object.entries(body.params)) {
        if (v !== undefined && v !== null) {
          apiParams.set(k, String(v));
        }
      }
    }

    const apiUrl = new URL("https://platform.fatsecret.com/rest/server.api");
    apiUrl.search = apiParams.toString();

    // Make FatSecret Data Request routing through the proxy
    const apiResponse = await fetch(apiUrl.toString(), {
      method: "GET",
      client: proxyClient, // <-- PROXY ROUTING
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok || data?.error) {
      const errMsg =
        data?.error?.message ||
        (typeof data?.error === "string" ? data.error : null) ||
        `FatSecret API returned error status HTTP ${apiResponse.status}`;

      // Gracefully handle IP whitelisting errors (Error 21)
      if (
        data?.error?.code === 21 ||
        errMsg.toLowerCase().includes("invalid ip address")
      ) {
        console.error("[FatSecret IP Whitelisting Rejection] Code 21:", errMsg);
        return new Response(
          JSON.stringify({
            error: "FatSecret API: Invalid IP address detected (Code 21). Ensure IP Restriction is disabled in platform.fatsecret.com.",
            code: 21,
            circuit_breaker: true,
            food: null,
            foods: { food: [] },
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Gracefully handle "Invalid barcode" or not found cases as 200 with empty food payload
      if (
        data?.error?.code === 8 ||
        errMsg.toLowerCase().includes("invalid barcode") ||
        errMsg.toLowerCase().includes("not found")
      ) {
        return new Response(
          JSON.stringify({
            food: null,
            foods: { food: [] },
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: errMsg,
          details: data,
        }),
        {
          status: apiResponse.status !== 200 ? apiResponse.status : 502,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // If barcode lookup returned a food_id, fetch nutritional details for complete food info
    let foodDetails = null;
    const foodId = data?.food_id?.value;

    if (foodId && foodId !== "0" && method === "food.find_id_for_barcode") {
      try {
        const detailUrl = new URL("https://platform.fatsecret.com/rest/server.api");
        detailUrl.search = new URLSearchParams({
          method: "food.get.v2",
          food_id: String(foodId),
          format: "json",
        }).toString();

        const detailRes = await fetch(detailUrl.toString(), {
          method: "GET",
          client: proxyClient, // <-- PROXY ROUTING
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (detailRes.ok) {
          foodDetails = await detailRes.json();
        }
      } catch (detailError) {
        console.warn("Could not retrieve extended food details for food_id:", foodId, detailError);
      }
    }

    let responsePayload = foodDetails
      ? { ...data, food: foodDetails?.food || foodDetails }
      : data;

    // When mapping food.get.v2 (or barcode lookup resolved food details), check food_images and map image_url
    const resolvedFood = responsePayload.food || (method === "food.get.v2" ? responsePayload : null);
    if (resolvedFood) {
      const primaryImageUrl = extractImageUrl(resolvedFood);
      resolvedFood.image_url = primaryImageUrl;
      responsePayload.image_url = primaryImageUrl;
    }

    // Map foods.search results to include normalized image_url
    if (responsePayload.foods?.food) {
      const foodList = Array.isArray(responsePayload.foods.food)
        ? responsePayload.foods.food
        : [responsePayload.foods.food];

      responsePayload.foods = {
        ...responsePayload.foods,
        food: foodList.map((item: any) => ({
          ...item,
          image_url: extractImageUrl(item),
        })),
      };
    }

    return new Response(JSON.stringify(responsePayload), {
      status: apiResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("FATAL FATSECRET EXCEPTION CAUGHT:", err.message, err.stack);
    return new Response(
      JSON.stringify({
        error: err.message || "An unexpected error occurred during FatSecret lookup",
        stack: err.stack
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});