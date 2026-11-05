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
    const { imageBase64, mimeType = "image/jpeg", goals } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY environment variable is not configured." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanImage = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const userGoals =
      Array.isArray(goals) && goals.length > 0
        ? goals.join(", ")
        : typeof goals === "string" && goals.trim()
        ? goals.trim()
        : "General Fitness & Health";

    const systemGoalsPrefix = `SYSTEM: The user's fitness goals are ${userGoals}. Tailor your entire breakdown, tone, and recommendations to actively support these goals.\n\n`;

    const prompt = `${systemGoalsPrefix}You are an expert UK sports nutritionist and OCR specialist.
Analyze this personal trainer (PT) plan, macro target sheet, or nutrition document.
Extract exact numbers matching the database schema for daily targets:
- calories: target total calories (number or null)
- protein: target protein in grams (number or null)
- carbs: target carbs in grams (number or null)
- fats: target fats in grams (number or null)
- notes: concise text string covering all dietary constraints, rules, forbidden foods, workout guidelines, and notes.

If a range is given for any target, take the upper value.
Respond ONLY with a valid, raw JSON object matching this exact structure:
{
  "calories": 2400,
  "protein": 180,
  "carbs": 220,
  "fats": 70,
  "notes": "string with dietary rules and guidelines"
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let response: Response;
    try {
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { mimeType, data: cleanImage } },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });
    } catch (fetchErr: any) {
      return new Response(
        JSON.stringify({ error: `Gemini Network Error: ${fetchErr.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI provider error: ${errorText || response.statusText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!rawJson) {
      return new Response(
        JSON.stringify({ error: "Gemini returned empty response." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleaned = rawJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("pt-plan error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});

