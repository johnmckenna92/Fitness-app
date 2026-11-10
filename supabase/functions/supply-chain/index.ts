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
    const { ingredients } = await req.json().catch(() => ({}));

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return Response.json(
        { error: "Invalid or empty ingredients array provided." },
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

    const systemInstruction = `You are an expert UK grocery supply-chain planner and sports nutritionist. Group these ingredients by UK supermarket aisle (e.g. Fresh Produce, Bakery, Butchery & Poultry, Chilled Dairy, Tinned & Pantry, Frozen).
Consolidate repeated raw ingredients and convert quantities strictly into standard UK supermarket packaging standards and metrics:
- Weights in grams (g) or kilograms (kg) (e.g. "500g lean beef mince 5% fat", "1kg easy-peeler clementines").
- Liquids in millilitres (ml) or litres (L) (e.g. "300ml whole milk", "500ml olive oil").
- Standard UK pack sizes, jars, and tins (e.g. "6-pack free-range large eggs", "2x 400g tins chopped tomatoes", "340g jar smooth peanut butter", "400g loaf seeded bread").
- Loose produce as natural whole items or metric weights (e.g. "4x bananas", "1kg loose Gala apples").
NEVER output awkward quantities like "1 unit of a loose gala apple", "1 unit of chicken breast", or tiny impractical fractions like "34.5g peanut butter".
Ensure absolute consistency with UK English spelling across all item descriptions (e.g. "mince", "courgette", "aubergine", "flavour", "wholemeal").
OUTPUT STRICTLY AS A JSON ARRAY of objects with 'aisle' (string) and 'items' (array of strings). DO NOT output any conversational text, explanatory notes, or markdown formatting. ONLY output the valid JSON array.`;

    const userContent = `Weekly Protocol Raw Ingredients:\n${JSON.stringify(ingredients, null, 2)}`;

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
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
      return Response.json(
        { error: `Gemini Network Error: ${fetchErr.message}` },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: `Gemini API error: ${response.status} - ${errorText}` },
        { status: 400, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!outputText) {
      return Response.json(
        { error: "Gemini returned empty supply chain data." },
        { status: 400, headers: corsHeaders }
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

    return Response.json(items, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to optimize grocery list." },
      { headers: corsHeaders, status: 400 }
    );
  }
});


