import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

const SYSTEM_PROMPT = `Analyze the person in this image based on the following four anatomical markers and then provide 3-5 specific hairstyle recommendations that would best balance their unique features:

1. Facial Thirds: Determine if the upper third (forehead) is narrow, large, or balanced. Recommend styles that either expose a small forehead to create height or use textured bangs/forward styling to visually reduce a prominent one.

2. Symmetry Level: Evaluate the structural symmetry of the face. If there is noticeable asymmetry in the eyes or jaw, recommend messy, irregular, or side-parted styles to prevent the eye from locking onto the unevenness. Only suggest clean middle parts or buzz cuts if the face is highly balanced.

3. Vertical Proportions: Assess the vertical face length. If the face is elongated, suggest horizontal styles with volume on the sides and flat tops. If the face is compressed, suggest styles with vertical height (like quiffs or upward-styled hair) to elongate the silhouette.

4. Jawline Projection: Check if the jaw is angular and defined or softer. Recommend shorter cuts (like buzz cuts) to emphasize a strong jaw, or textured, medium-length styles to soften and redirect attention from a less projected lower third.

Final Output: Return ONLY a valid JSON object with exactly these keys. No markdown, no extra text:
- "facial_thirds": A concise 1-2 sentence finding and recommendation about the forehead/upper face region.
- "symmetry": A concise 1-2 sentence finding and recommendation about facial symmetry (eyes, jaw alignment).
- "vertical_proportions": A concise 1-2 sentence finding and recommendation about the vertical face length.
- "jawline_projection": A concise 1-2 sentence finding and recommendation about the jaw shape and projection.
- "best_styles_summary": A single string listing the best 3 hairstyle names separated by commas (e.g. 'Textured Crop, Buzz Cut, Classic Taper').
`;

export async function POST(req: NextRequest) {
  try {
    console.log("\n--- [API Route] Incoming POST Request to /api/analyze ---");
    const formData = await req.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      console.error("[API Route] No image found in the request payload.");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    console.log(`[API Route] Received image size: ${(bytes.byteLength / 1024).toFixed(2)} KB, MIME: ${file.type}`);

    if (!geminiApiKey) {
      return NextResponse.json({
        analysis: {
          facial_thirds: "Simulated face thirds",
          symmetry: "High symmetry",
          vertical_proportions: "Balanced",
          jawline_projection: "Strong",
        },
        best_styles_summary: "Textured Crop, Buzz Cut, Classic Taper",
      });
    }

    // 1. Send to Gemini
    console.log(`[API Route] 1. Dispatching to gemini-2.5-flash for structural facial analysis...`);
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: SYSTEM_PROMPT },
        { inlineData: { mimeType: file.type, data: base64Image } }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const textResult = result.text || "{}";
    let facialThirds = "";
    let symmetry = "";
    let verticalProportions = "";
    let jawlineProjection = "";
    let stylesToGenerate = "";
    

    try {
      const parsed = JSON.parse(textResult);
      facialThirds = parsed.facial_thirds || "";
      symmetry = parsed.symmetry || "";
      verticalProportions = parsed.vertical_proportions || "";
      jawlineProjection = parsed.jawline_projection || "";
      stylesToGenerate = parsed.best_styles_summary || textResult;
      
      console.log(`[API Route] Successfully parsed JSON. Styles: "${stylesToGenerate}"`);
    } catch (e) {
      console.warn("[API Route] Failed to parse JSON response:", e);
      facialThirds = textResult;
      stylesToGenerate = textResult;
    }

    // Filter to limit to 3 hairstyles as requested
    // Removed Nano Banana 2 step directly in this endpoint. Will send response back to client to show intermediate.

    return NextResponse.json({
      analysis: {
        facial_thirds: facialThirds,
        symmetry: symmetry,
        vertical_proportions: verticalProportions,
        jawline_projection: jawlineProjection,
      },
      best_styles_summary: stylesToGenerate,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[API Route] Ultimate Analysis Catch Error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to process image." },
      { status: 500 }
    );
  }
}
