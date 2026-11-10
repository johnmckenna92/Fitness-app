import { createClient } from "jsr:@supabase/supabase-js@^2.45.4";

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
    console.log("Incoming request received to coach-chat");
    
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined
    );

    let uuid: string | null = null;
    if (authHeader) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (!authErr && user) {
        uuid = user.id;
      }
    }

    const body = await req.json().catch(() => ({}));
    const { message, history, profile: clientProfile } = body;

    console.log("Parsed request body successfully. Message length:", message?.length);

    if (!message) {
      return Response.json(
        { error: "Message is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
      return Response.json(
        { error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 500, headers: corsHeaders }
      );
    }

    let dbProfile: any = null;
    let dbPrefs: any = null;

    if (uuid) {
      const [profileRes, prefsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uuid).maybeSingle(),
        supabase.from("user_preferences").select("*").eq("user_id", uuid).maybeSingle(),
      ]);
      dbProfile = profileRes.data;
      dbPrefs = prefsRes.data;
    }

    const resolved = { ...(clientProfile || {}), ...(dbProfile || {}) };
    const age = resolved.age || "30";
    const sex = resolved.sex || resolved.gender || "client";
    const activity = resolved.activity_level || resolved.activity || "active";

    const likedTags: string[] = Array.isArray(dbPrefs?.liked_tags) && dbPrefs.liked_tags.length > 0
      ? dbPrefs.liked_tags
      : (Array.isArray(body?.userPreferences?.liked_tags) ? body.userPreferences.liked_tags : []);
    const dislikedTags: string[] = Array.isArray(dbPrefs?.disliked_tags) && dbPrefs.disliked_tags.length > 0
      ? dbPrefs.disliked_tags
      : (Array.isArray(body?.userPreferences?.disliked_tags) ? body.userPreferences.disliked_tags : []);

    const topPositive = likedTags.length > 0 ? likedTags.slice(0, 3).join(", ") : "balanced nutrition";
    const topNegative = dislikedTags.length > 0 ? dislikedTags.slice(0, 3).join(", ") : "none";

    const strictGuardrail =
      "You are a strict nutrition and fitness coach. If the user uploads an image or asks a question unrelated to food, fitness, nutrition, or physical training, you must politely refuse to answer. Do NOT process non-food items.";

    const dynamicPersona = `You are an elite UK fitness and nutrition coach. ${strictGuardrail} Your client is a ${age} year old ${sex} with an activity level of ${activity}. Based on their app interactions, they heavily prefer ${topPositive} and dislike ${topNegative}. Tailor all advice to these facts. Always enforce strict UK English spelling (e.g. 'flavour', 'fibre', 'programme', 'optimise', 'courgette', 'aubergine') and UK metric units (kg, cm, grams, ml).`;

    const userGoals = resolved?.goals && Array.isArray(resolved.goals) && resolved.goals.length > 0
      ? resolved.goals.join(", ")
      : typeof resolved?.goals === "string" && resolved.goals.trim()
      ? resolved.goals.trim()
      : "General Fitness & Health";

    const rawProtocolNotes = resolved?.protocol_notes || resolved?.pt_notes;
    const protocolNotes = typeof rawProtocolNotes === "string" ? rawProtocolNotes.trim() : "";
    const protocolNotesSection = protocolNotes
      ? `\n\nThe user is following this specific protocol: ${protocolNotes}. You must adhere strictly to these rules when giving advice.`
      : "";

    const systemPrompt = `${strictGuardrail}\n\n${dynamicPersona}\nThe user's fitness goals are ${userGoals}.\nDaily Targets: ${resolved?.target_calories || 0} kcal, ${resolved?.target_protein || 0}g protein, ${resolved?.target_carbs || 0}g carbs, ${resolved?.target_fats || 0}g fats.${protocolNotesSection}\nKeep responses highly concise, motivational, and strictly focused on these targets and UK fitness standards.`;

    const chatHistory = Array.isArray(history)
      ? history.map((m: any) => `${m.role === "user" ? "User" : "Coach"}: ${m.text}`).join("\n")
      : "";

    const fullPrompt = `${systemPrompt}\n\nChat History:\n${chatHistory}\n\nUser: ${message}\nCoach:`;

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            systemInstruction: {
              parts: [{ text: `${strictGuardrail}\n\n${dynamicPersona}${protocolNotesSection}` }],
            },
          }),
        }
      );
    } catch (fetchErr: any) {
      console.error("Fetch Execution Error:", fetchErr);
      return Response.json(
        { error: `Gemini Network Error: ${fetchErr.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini Upstream Rejection (${response.status}):`, errorText);
      return Response.json(
        { error: `Gemini API error: ${response.status}\n${errorText}` },
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!outputText) {
      console.log("Successfully generated response, sending back:", outputText.substring(0, 50));
      return Response.json(
        { reply: outputText },
        { status: 200, headers: corsHeaders }
      );
    }

    return Response.json(
      { reply: outputText },
      { status: 200, headers: corsHeaders }
    );
  } catch (e: any) {
    console.error("FATAL CRASH IN COACH-CHAT:", e.message, e.stack);
    return Response.json(
      { error: e.message || "Failed to generate coach response." },
      { status: 500, headers: corsHeaders }
    );
  }
});