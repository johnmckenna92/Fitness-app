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
    const { base64Image, mimeType = "image/jpeg" } = await req.json().catch(() => ({}));

    if (!base64Image || typeof base64Image !== "string" || base64Image.trim().length === 0) {
      return Response.json(
        { error: "No image data provided for safety validation." },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return Response.json(
        { error: "Moderation service configuration missing." },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    const prompt =
      "You are a strict App Store UGC moderator. Analyze this image for nudity, sexually explicit content, extreme violence, gore, or hate symbols. If any are present, isSafe is false and provide a brief reason. Otherwise, isSafe is true.";

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
                { inlineData: { mimeType, data: cleanBase64 } },
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
        { error: `Safety check network error: ${fetchErr.message}` },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Safety check error: ${errorText}` },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const cleaned = rawJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned || "{}");

    const isSafe = Boolean(parsed.isSafe);
    const reason =
      typeof parsed.reason === "string" && parsed.reason.trim().length > 0
        ? parsed.reason.trim()
        : isSafe
        ? "Image meets content safety standards."
        : "Image violates App Store safety guidelines.";

    return Response.json(
      { isSafe, reason },
      { headers: corsHeaders, status: 200 }
    );
  } catch (e: any) {
    return Response.json(
      { error: e.message || "Safety validation failed." },
      { status: 400, headers: corsHeaders }
    );
  }
});


