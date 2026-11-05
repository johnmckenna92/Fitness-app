import { GoogleGenAI } from "@google/genai";

// This automatically pulls from your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { base64Image, mimeType } = await request.json();

    if (!base64Image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    // Switched to gemini-1.5-flash: The cheapest, fastest model for OCR & structured data
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
              text: `You are an expert UK sports nutritionist. Analyse this diet plan, macro target sheet, or meal schedule. 
              Extract the daily target calories, daily target protein (in grams), and the intended number of meals per day.
              If a range is given, take the upper value. If meals per day isn't explicitly stated, count the distinct feeding windows.
              
              Respond ONLY with a valid, raw JSON object matching this exact structure, with no markdown formatting or backticks:
              {
                "calories": 2200,
                "protein": 140,
                "meals": 4
              }`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.1, // Keep it low so it doesn't hallucinate numbers
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text;

    if (!textOutput) {
      throw new Error("Gemini returned an empty response.");
    }

    const extractedMacros = JSON.parse(textOutput.trim());

    return Response.json({ success: true, data: extractedMacros });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return Response.json(
      { error: error.message || "Failed to analyse diet plan" },
      { status: 500 },
    );
  }
}
