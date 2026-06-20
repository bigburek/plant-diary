/**
 * AI plant identification using Google Gemini's free vision API.
 *
 * Google AI Studio (https://aistudio.google.com/apikey) offers a generous,
 * no-credit-card-required free tier for Gemini Flash models. We send a
 * downscaled photo of the plant and ask the model to return strict JSON
 * describing what it sees.
 *
 * Get a free key at https://aistudio.google.com/apikey and put it in your
 * .env as GEMINI_API_KEY=AIzaSyxxxxxxxx
 */
import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';

export type PlantIdentificationResult = {
  isPlant: boolean;
  commonName: string;
  scientificName: string;
  confidence: number; // 0-100
  wateringIntervalDays: number;
  sunlight: string;
  careTips: string;
};

// Primary model: fast, generous free tier, strong vision quality.
const GEMINI_MODEL_PRIMARY = 'gemini-2.5-flash';
// Fallback model in case the primary one is unavailable/rate-limited.
const GEMINI_MODEL_FALLBACK = 'gemini-2.5-flash-lite';

const GEMINI_ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const SYSTEM_PROMPT = `You are a houseplant identification assistant embedded in a plant-care app.
You will be shown one photo. Respond with STRICT JSON ONLY (no markdown, no commentary, no code fences) matching exactly this shape:

{
  "isPlant": boolean,
  "commonName": string,
  "scientificName": string,
  "confidence": number,
  "wateringIntervalDays": number,
  "sunlight": string,
  "careTips": string
}

Rules:
- "isPlant": false if the photo does not clearly contain a plant; in that case other fields can be best-effort guesses.
- "commonName": short, friendly common name (e.g. "Swiss Cheese Plant").
- "scientificName": botanical/Latin name (e.g. "Monstera deliciosa"). If unsure, give your best single guess, never leave empty.
- "confidence": your identification confidence from 0 to 100.
- "wateringIntervalDays": a sensible integer number of days between waterings for an average indoor environment (typically between 3 and 21).
- "sunlight": short phrase, e.g. "Bright indirect light".
- "careTips": 1-2 short sentences with practical care advice.
Return ONLY the JSON object, nothing else.`;

function getApiKey(): string | undefined {
  const key = Constants.expoConfig?.extra?.geminiApiKey;
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : undefined;
}

export class PlantIdentifyError extends Error {
  code: 'NO_API_KEY' | 'NETWORK' | 'PARSE' | 'EMPTY';
  constructor(code: PlantIdentifyError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Resizes/compresses the picked image and returns a base64 JPEG string
 * so requests stay small and fast.
 */
export async function prepareImageForIdentification(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 768 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!result.base64) {
    throw new PlantIdentifyError('EMPTY', 'Could not process the selected image.');
  }
  return result.base64;
}

async function callGeminiVision(model: string, apiKey: string, base64Image: string): Promise<string> {
  const response = await fetch(GEMINI_ENDPOINT(model), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${SYSTEM_PROMPT}\n\nIdentify the plant in this photo and respond with the JSON object described above.` },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new PlantIdentifyError('NETWORK', `Gemini API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content || typeof content !== 'string') {
    throw new PlantIdentifyError('EMPTY', 'Gemini returned an empty response.');
  }
  return content;
}

function parseResult(raw: string): PlantIdentificationResult {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new PlantIdentifyError('PARSE', 'Could not parse the AI response.');
  }

  const wateringInterval = Number(parsed.wateringIntervalDays);

  return {
    isPlant: Boolean(parsed.isPlant ?? true),
    commonName: String(parsed.commonName ?? '').trim(),
    scientificName: String(parsed.scientificName ?? '').trim(),
    confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)),
    wateringIntervalDays: Number.isFinite(wateringInterval) && wateringInterval > 0 ? Math.round(wateringInterval) : 7,
    sunlight: String(parsed.sunlight ?? '').trim(),
    careTips: String(parsed.careTips ?? '').trim(),
  };
}

/**
 * Identifies a plant from a local image URI (e.g. from expo-image-picker).
 * Throws PlantIdentifyError on failure.
 */
export async function identifyPlantFromImage(imageUri: string): Promise<PlantIdentificationResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new PlantIdentifyError(
      'NO_API_KEY',
      'No Gemini API key configured. Add GEMINI_API_KEY to your .env (free at aistudio.google.com/apikey).'
    );
  }

  const base64Image = await prepareImageForIdentification(imageUri);

  let content: string;
  try {
    content = await callGeminiVision(GEMINI_MODEL_PRIMARY, apiKey, base64Image);
  } catch (primaryError) {
    content = await callGeminiVision(GEMINI_MODEL_FALLBACK, apiKey, base64Image);
  }

  return parseResult(content);
}
