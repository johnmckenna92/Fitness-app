import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      query,
      scanType,
      imageBase64,
      image,
      mimeType = "image/jpeg",
      profile = {},
      telemetry = {},
    } = body;

    const rawImage =
      imageBase64 ||
      image ||
      (typeof query === "string" && query.startsWith("data:") ? query : null);
    const cleanImage = rawImage
      ? rawImage.replace(/^data:image\/[a-zA-Z+]+;base64,/, "")
      : (typeof query === "string" && query.length > 200 && !query.includes(" ") ? query : null);

    const textQuery = cleanImage ? null : (typeof query === "string" ? query : null);

    if (!cleanImage && !textQuery) {
      return new Response(
        JSON.stringify({ error: "No image or query provided for analysis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY environment variable is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mergedGoals = telemetry?.goals || profile?.goals || [];
    const userGoals = Array.isArray(mergedGoals) && mergedGoals.length > 0
      ? mergedGoals.join(", ")
      : typeof mergedGoals === "string" && mergedGoals.trim()
      ? mergedGoals.trim()
      : "General Fitness & Health";

    const dailyTargets = telemetry?.dailyTargets || {
      protein: telemetry?.target_protein ?? profile?.target_protein ?? 0,
      carbs: telemetry?.target_carbs ?? profile?.target_carbs ?? 0,
      fats: telemetry?.target_fats ?? profile?.target_fats ?? 0,
      calories: telemetry?.target_calories ?? profile?.target_calories ?? 0,
    };

    const isTrainingDay = telemetry?.isTrainingDay ?? true;
    const isDeepDive =
      scanType === "deep-dive" ||
      telemetry?.isDeepDive === true ||
      body?.isDeepDive === true;
    const isPro = telemetry?.isPro ?? true;
    const isDeepDiveActive = isDeepDive && isPro;

    const ptNotes = telemetry?.pt_notes || profile?.pt_notes || "";
    const ptNotesSection = telemetry?.ptNotesSection || (ptNotes.trim()
      ? `\n\nPersonal Trainer Rules & Plan Guidelines:\n"""\n${ptNotes.trim()}\n"""\nIMPORTANT: Explicitly flag if the scanned food violates any of the uploaded PT rules (e.g., forbidden ingredients, allergens, or dietary restrictions).`
      : "");

    const systemGoalsPrefix = `SYSTEM: The user's fitness goals are ${userGoals}. Tailor your entire breakdown, tone, and recommendations to actively support these goals.\n\n`;

    const deepDiveSystemPrompt =
      `You are an elite clinical nutritionist and sports scientist. Analyze this food label/meal. ` +
      `USER PROTOCOL: Goals: ${userGoals}. Target Macros: ${dailyTargets.protein || 0}g P, ${dailyTargets.carbs || 0}g C, ${dailyTargets.fats || 0}g F. Status: ${isTrainingDay ? "Training Day (High Fuel)" : "Rest Day (Low Fuel)"}. ` +
      `TASK: Ignore standard estimations. Analyze for artificial additives, emulsifiers, and protein bioavailability. ` +
      `Determine if this food optimally fits their specific protocol today. ` +
      `OUTPUT FORMAT: Must be Markdown. Start with '## VERDICT: [🟢 GREEN / 🟡 AMBER / 🔴 RED] - [One sentence summary]'. Then sections for '### Protocol Alignment', '### Chemical/Additive Audit', and '### Protein Quality'.`;

    const standardPrompt = `${systemGoalsPrefix}Analyze this food or nutrition label. 
The user's daily targets are: ${dailyTargets.calories || 0} kcal, ${dailyTargets.protein || 0}g protein, ${dailyTargets.carbs || 0}g carbs, ${dailyTargets.fats || 0}g fats.${ptNotesSection}
Please estimate the macros (Calories, Protein, Carbs, Fats) per typical serving and briefly state if this is a good fit for their targets.
Return a highly structured breakdown of this meal. Use '##' for section headers (e.g., ## Macros, ## Ingredients, ## Health Score) and bullet points for lists. Do not use JSON.`;

    const promptText = isDeepDiveActive ? deepDiveSystemPrompt : standardPrompt;

    const parts: any[] = [];
    if (cleanImage) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanImage,
        },
      });
      parts.push({ text: promptText });
    } else {
      parts.push({ text: `${promptText}\n\nItem or Food to analyze:\n${textQuery}` });
    }

    const requestPayload: any = { contents: [{ role: "user", parts }] };
    if (isDeepDiveActive) {
      requestPayload.systemInstruction = {
        parts: [{ text: deepDiveSystemPrompt }],
      };
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI provider error: ${response.statusText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!outputText) {
      return new Response(
        JSON.stringify({ error: "Gemini returned an empty response." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ analysis: outputText, markdown: outputText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("ingredient-scanner error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
