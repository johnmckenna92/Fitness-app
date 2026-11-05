import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ingredients } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or empty ingredients array provided." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY environment variable is not configured." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemInstruction = `Group these ingredients by supermarket aisle. Convert quantities into standard UK supermarket pack sizes to minimize waste. OUTPUT STRICTLY AS A JSON ARRAY of objects with 'aisle' and 'items' (array of strings). DO NOT output any conversational text or markdown formatting. ONLY output the JSON list.`;

    const userContent = `Weekly Protocol Raw Ingredients:\n${JSON.stringify(ingredients, null, 2)}`;

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemInstruction}\n\n${userContent}` }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );
    } catch (fetchErr: any) {
      return new Response(
        JSON.stringify({ error: `Gemini Network Error: ${fetchErr.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status} - ${errorText}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!outputText) {
      return new Response(
        JSON.stringify({ error: "Gemini returned empty supply chain data." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleaned = outputText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    const items = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.items)
      ? parsed.items
      : [];

    return new Response(JSON.stringify(items), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to optimize grocery list." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});


