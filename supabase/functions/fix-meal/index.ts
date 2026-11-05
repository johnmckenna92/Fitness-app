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
    const { meal } = await req.json();
    const trimmed = meal?.trim();

    if (!trimmed) {
      return new Response(
        JSON.stringify({ error: "Please enter a meal idea to fix." }),
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

    const prompt = `You are an elite sports nutritionist. The user wants to eat: ${trimmed}. Re-engineer this meal to maximize protein and optimize macros for body recomposition. Keep prep time under 20 minutes. Output strictly in Markdown with headers: ## The Problem, ## The Fix, ## Upgraded Macros, ## Quick Instructions.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    let response: Response;
    try {
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
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
      return new Response(
        JSON.stringify({ error: `AI provider error: ${errorText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!output) {
      return new Response(
        JSON.stringify({ error: "Gemini returned an empty response." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ markdown: output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to fix meal." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});

