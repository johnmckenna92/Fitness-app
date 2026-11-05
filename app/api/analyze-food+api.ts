import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { base64Image, mimeType } = await request.json();

    if (!base64Image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType || "image/jpeg",
              },
            },
            {
              text: `You are an expert AI sports nutritionist. Analyze this food image, meal, or nutrition label.
              Estimate the nutritional content as accurately as possible. 
              Respond ONLY with a valid, raw JSON object matching this exact structure, with no markdown formatting or backticks:
              {
                "food_name": "Name of the dish or item",
                "calories": 450,
                "protein": 30,
                "carbs": 40,
                "fats": 15,
                "confidence": "High | Medium | Low",
                "description": "A brief, one-sentence description of the meal and its nutritional value."
              }`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.2, // Low temperature for more factual estimations
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text;

    if (!textOutput) {
      throw new Error("Gemini returned an empty response.");
    }

    const extractedData = JSON.parse(textOutput.trim());
    return Response.json({ success: true, data: extractedData });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return Response.json(
      { error: error.message || "Failed to analyze food" },
      { status: 500 },
    );
  }
}
