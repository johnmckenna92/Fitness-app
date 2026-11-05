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
    const { message, history, profile } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required." }),
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

    const ptNotesSection = profile?.pt_notes?.trim()
      ? `\n\nPersonal Trainer Rules & Plan Notes:\n"""\n${profile.pt_notes.trim()}\n"""\nYou MUST strictly enforce these specific PT rules in all advice, recommendations, and motivation you give.`
      : "";

    const userGoals =
      profile?.goals && profile.goals.length > 0
        ? profile.goals.join(", ")
        : "General Fitness & Health";

    const systemGoalsPrefix = `SYSTEM: The user's fitness goals are ${userGoals}. Tailor your entire breakdown, tone, and recommendations to actively support these goals.\n\n`;

    const systemPrompt = `${systemGoalsPrefix}You are an elite AI Personal Trainer and Sports Nutritionist for a UK-based client. 
    The user's daily targets are: ${profile?.target_calories || 0} kcal, ${profile?.target_protein || 0}g protein, ${profile?.target_carbs || 0}g carbs, ${profile?.target_fats || 0}g fats.${ptNotesSection} 
    Keep responses highly concise, motivational, and strictly focused on these targets and UK fitness standards.`;

    const chatHistory = Array.isArray(history)
      ? history.map((m: any) => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`).join("\n")
      : "";

    const fullPrompt = `${systemPrompt}\n\nChat History:\n${chatHistory}\n\nUser: ${message}\nCoach:`;

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
                parts: [{ text: fullPrompt }],
              },
            ],
          }),
        }
      );
    } catch (fetchErr: any) {
      return new Response(
        JSON.stringify({ error: `Gemini Network Error: ${fetchErr.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status} - ${errorText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!outputText) {
      return new Response(
        JSON.stringify({ error: "Gemini returned empty response." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ reply: outputText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to generate coach response." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

