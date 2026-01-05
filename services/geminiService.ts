
import { GoogleGenAI } from "@google/genai";
import { ShotType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SHOT_PROMPTS: Record<ShotType, (productName: string) => string> = {
  MAIN: (product) => `Professional Amazon main product image of ${product}. Isolated on a pure white background. High resolution, crisp focus, studio lighting, centered composition, front-facing view. Minimalist, premium quality.`,
  LIFESTYLE: (product) => `A high-end lifestyle photography shot of ${product} being used in a modern, stylish interior setting. Natural warm sunlight, cinematic depth of field, high aesthetic quality, realistic textures.`,
  DETAIL: (product) => `Extreme macro close-up shot of the material and texture of ${product}. Showing off fine details, craftsmanship, and build quality. Soft bokeh background, professional product photography lighting.`,
  ANGLE: (product) => `Professional product shot of ${product} from a 45-degree isometric perspective. Soft shadows, studio lighting, high resolution. Demonstrating the three-dimensional form and depth of the product.`,
  DIMENSION: (product) => `Product showcase of ${product} from a side profile view. Sleek, professional photography, high-end commercial style. Focus on the slimness or structural profile.`,
};

export async function generateProductImage(productName: string, shotType: ShotType, base64Reference?: string): Promise<string> {
  const basePrompt = SHOT_PROMPTS[shotType](productName);
  const prompt = base64Reference 
    ? `Based on the product shown in the attached image, generate a new ${basePrompt}. Maintain the exact same product design, color, and features.`
    : basePrompt;
  
  const parts: any[] = [{ text: prompt }];

  if (base64Reference) {
    const mimeTypeMatch = base64Reference.match(/data:(.*?);/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
    const base64Data = base64Reference.split(',')[1];
    
    parts.unshift({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error(`Error generating ${shotType} image:`, error);
    throw error;
  }
}
