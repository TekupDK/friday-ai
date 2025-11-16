import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
// Using direct REST call to Gemini API to avoid SDK compatibility issues

async function main() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_API_TOKEN ||
    "";
  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set in environment");
    process.exit(1);
  }

  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

  const prompt =
    "Create a modern, minimalist logo for Friday AI. Use bold sans-serif font with an abstract AI symbol. Colors: blue and white.";

  try {
    // Prefer the images API when available
    // Fallback to text model returning inline base64 image part
    let base64Data: string | null = null;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${text}`);
    }
    const json = await res.json();
    const candidates = json?.candidates || [];
    for (const c of candidates) {
      const parts = c?.content?.parts || [];
      for (const p of parts) {
        const inline = p?.inline_data || p?.inlineData;
        const mime = inline?.mime_type || inline?.mimeType;
        const data = inline?.data;
        if (data && typeof data === "string" && mime?.startsWith("image/")) {
          base64Data = data;
          break;
        }
      }
      if (base64Data) break;
    }

    if (!base64Data) {
      console.error("No image data returned by Gemini");
      process.exit(2);
    }

    const buffer = Buffer.from(base64Data, "base64");
    const outDir = path.resolve(process.cwd(), "client", "public", "brandkit");
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, "logo-full.png");
    writeFileSync(outPath, buffer);
    console.log("✅ Logo generated:", outPath);
    console.log('Use src="/brandkit/logo-full.png" in your UI');
  } catch (err: any) {
    console.error("Logo generation failed:", err?.message || err);
    process.exit(3);
  }
}

main();
