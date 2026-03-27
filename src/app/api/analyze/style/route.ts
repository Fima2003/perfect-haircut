import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const style = formData.get("style") as string;
    
    if (!file || !style) {
      return NextResponse.json({ error: "Image and style are required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    if (!geminiApiKey) {
      // Mock generated image
      return NextResponse.json({
        image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
      });
    }

    const prompt = [
      {
        text:
          `You are an expert AI photo editor for hairstyling. Apply the hairstyle "${style}" to the person in the provided photo. ` +
          `\n\nCRITICAL INSTRUCTIONS:\n` +
          `1. Output EXACTLY ONE single, unified photograph. DO NOT generate multiple poses, variations, split-screens, collages, or stacked images under any circumstances.\n` +
          `2. Maintain the EXACT framing, aspect ratio, crop, and camera angle of the original image.\n` +
          `3. Change ONLY the hair on the person's head (style, length, texture, volume). Do not add unrelated objects.\n` +
          `4. Preserve the exact original face shape, skin texture, features, facial hair, expression, and lighting.\n` +
          `5. Preserve the exact original attire, background, and environment without any alterations.`,
      },
      {
        inlineData: {
          mimeType: file.type,
          data: base64Image,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    let generatedImage = null;

    for (const part of parts) {
      if (part.inlineData && !generatedImage) {
        const imgMimeType = part.inlineData.mimeType || "image/png";
        const dataStr = part.inlineData.data || "";
        generatedImage = `data:${imgMimeType};base64,${dataStr}`;
      }
    }

    if (!generatedImage) {
      throw new Error("No image returned from Gemini representation.");
    }

    return NextResponse.json({ image: generatedImage });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[API Route /style] Error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to generate style image." },
      { status: 500 }
    );
  }
}
