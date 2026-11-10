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
    const { imageBase64, mimeType = "image/jpeg", goals } = await req.json().catch(() => ({}));

    if (!imageBase64) {
      return Response.json(
        { error: "No image provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 400, headers: corsHeaders }
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
- pt_notes: concise text string covering all dietary constraints, rules, forbidden foods, workout guidelines, protocol notes, and coach instructions.

If a range is given for any target, take the upper value.
Respond ONLY with a valid, raw JSON object matching this exact structure:
{
  "calories": 2400,
  "protein": 180,
  "carbs": 220,
  "fats": 70,
  "pt_notes": "string with dietary rules and guidelines"
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

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
      return Response.json(
        { error: `Gemini Network Error: ${fetchErr.message}` },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return Response.json(
        { error: `AI provider error: ${errorText || response.statusText}` },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!rawJson) {
      return Response.json(
        { error: "Gemini returned empty response." },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleaned = rawJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    const extractedNotes = parsed.pt_notes ?? parsed.protocol_notes ?? parsed.notes ?? null;

    return Response.json(
      {
        ...parsed,
        pt_notes: extractedNotes,
        protocol_notes: extractedNotes,
        notes: extractedNotes,
      },
      {
        headers: corsHeaders,
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("pt-plan error:", error);
    return Response.json(
      { error: error.message || "Internal server error." },
      { headers: corsHeaders, status: 400 }
    );
  }
});

