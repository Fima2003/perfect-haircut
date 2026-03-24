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
- "dot_positions": An object with four keys, each containing the approximate position of that anatomical marker on the FACE in the image, expressed as percentages (0-100) of the image width (x) and image height (y):
  - "facial_thirds": { "x": <number>, "y": <number> } — center of the forehead
  - "symmetry": { "x": <number>, "y": <number> } — bridge of the nose / between the eyes
  - "vertical_proportions": { "x": <number>, "y": <number> } — tip of the nose (midpoint vertically)
  - "jawline_projection": { "x": <number>, "y": <number> } — center of the chin`;

// Generate one image per hairstyle — separate API call each time.
// The prompt is intentionally very strict: ONLY the hair changes, everything else is preserved.
async function generateHairstylesWithNanoBanana2(stylesCSV: string, base64Image: string, mimeType: string) {
  if (!geminiApiKey) {
    console.warn("[Nano Banana] API Key missing — returning placeholders");
    return [
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620054363297-bca9e944b58e?q=80&w=200&auto=format&fit=crop",
    ];
  }

  // Split comma-separated list of styles and take up to 3
  const styles = stylesCSV.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3);
  console.log(`[Nano Banana] Will generate ${styles.length} images for styles:`, styles);

  const images: string[] = [];

  for (const style of styles) {
    try {
      console.log(`[Nano Banana] Generating image for style: "${style}"`);

      const prompt = [
        {
          text:
            `You are a professional hair stylist photo editor. ` +
            `Apply ONLY the hairstyle "${style}" to the person in this photo. ` +
            `CRITICAL RULES — do NOT violate any of these:\n` +
            `1. Change ONLY the hair — style, length, texture, and volume.\n` +
            `2. Do NOT change the head angle, face direction, or pose in any way.\n` +
            `3. Do NOT change the background, clothing, skin tone, facial features, lighting, or expression.\n` +
            `4. The face must remain facing exactly the same direction as in the original image.\n` +
            `5. Output exactly one photorealistic edited image. No collages, no side-by-sides, no before/after.`,
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image,
          },
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: prompt,
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      let foundImage = false;
      for (const part of parts) {
        if (part.inlineData && !foundImage) {
          const imgMimeType = part.inlineData.mimeType || "image/png";
          const dataStr = part.inlineData.data || "";
          images.push(`data:${imgMimeType};base64,${dataStr}`);
          console.log(`[Nano Banana] ✓ Image captured for "${style}" (${dataStr.length} chars)`);
          foundImage = true; // only take the first image per style call
        }
      }
      if (!foundImage) {
        console.warn(`[Nano Banana] No image returned for style "${style}"`);
      }
    } catch (err) {
      console.error(`[Nano Banana] Error generating style "${style}":`, err);
    }
  }

  console.log(`[Nano Banana] Done. ${images.length}/${styles.length} images generated.`);
  return images;
}

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
        analysis: "Simulated analysis: High symmetry, balanced thirds. Suggested styles: Textured Crop, Buzz Cut, Classic Taper.",
        hairstyles: await generateHairstylesWithNanoBanana2("Textured Crop, Buzz Cut, Classic Taper.", base64Image, file.type)
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
    let dotPositions: Record<string, { x: number; y: number }> | null = null;

    try {
      const parsed = JSON.parse(textResult);
      facialThirds = parsed.facial_thirds || "";
      symmetry = parsed.symmetry || "";
      verticalProportions = parsed.vertical_proportions || "";
      jawlineProjection = parsed.jawline_projection || "";
      stylesToGenerate = parsed.best_styles_summary || textResult;
      dotPositions = parsed.dot_positions || null;
      console.log(`[API Route] Successfully parsed JSON. Styles: "${stylesToGenerate}", Dots:`, dotPositions);
    } catch (e) {
      console.warn("[API Route] Failed to parse JSON response:", e);
      facialThirds = textResult;
      stylesToGenerate = textResult;
    }

    // 2. Send to Nano Banana 2
    console.log(`[API Route] 2. Forwarding base image and suggested styles into Nano Banana 2...`);
    const generatedImages = await generateHairstylesWithNanoBanana2(stylesToGenerate, base64Image, file.type);

    // Filter to limit to 3 hairstyles as requested
    const limitedImages = generatedImages.slice(0, 3);
    console.log(`[API Route] Finished operations. Sending successful payload to client with ${limitedImages.length} images.`);

    return NextResponse.json({
      analysis: {
        facial_thirds: facialThirds,
        symmetry: symmetry,
        vertical_proportions: verticalProportions,
        jawline_projection: jawlineProjection,
      },
      dot_positions: dotPositions,
      best_styles_summary: stylesToGenerate,
      hairstyles: limitedImages
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
