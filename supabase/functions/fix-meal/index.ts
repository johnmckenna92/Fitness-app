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
    const { meal } = await req.json().catch(() => ({}));
    const trimmed = meal?.trim();

    if (!trimmed) {
      return Response.json(
        { error: "Please enter a meal idea to fix." },
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

    const prompt = `You are an elite UK sports nutritionist and body recomposition coach. The user wants to eat: "${trimmed}".
Re-engineer this meal to maximize protein, balance micronutrients, and optimize macros for body recomposition.
- Keep prep time under 20 minutes.
- All quantities MUST strictly use UK metric units (grams 'g', millilitres 'ml') or natural whole UK items.
- Enforce strict UK English spelling throughout all text (e.g., 'flavour', 'fibre', 'courgette', 'aubergine', 'mince', 'wholemeal', 'optimise').
Output strictly in Markdown with headers: ## The Problem, ## The Fix, ## Upgraded Macros, ## Quick Instructions.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

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
      return Response.json(
        { error: `Gemini Network Error: ${fetchErr.message}` },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `AI provider error: ${errorText}` },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!output) {
      return Response.json(
        { error: "Gemini returned an empty response." },
        { status: 400, headers: corsHeaders }
      );
    }

    return Response.json(
      { markdown: output },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Failed to fix meal." },
      { status: 400, headers: corsHeaders }
    );
  }
});


