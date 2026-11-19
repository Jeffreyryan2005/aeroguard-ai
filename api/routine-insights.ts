import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';
import type { ExpressLikeResponse, ServerlessRequest } from './emergency-advisory';
import { generateDeterministicPlan } from '../src/lib/clinicalPlan';
import { INITIAL_ZONES, VULNERABILITY_PERSONAS } from '../src/lib/constants';
import type { UrbanZone, VulnerabilityPersona } from '../src/types';

interface RoutineRequestBody {
  persona?: VulnerabilityPersona;
  zone?: UrbanZone;
  language?: string;
}

const cache = new Map<string, { data: unknown; time: number }>();

function hashObj(obj: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

export default async function handler(req: ServerlessRequest, res?: ExpressLikeResponse): Promise<Response | void> {
  const sendJson = (status: number, data: unknown): Response | void => {
    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Content-Security-Policy', "default-src 'self'");
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(status).json(data);
      return;
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'",
        'Access-Control-Allow-Origin': '*',
      },
    });
  };

  const method = req.method || (req.headers ? 'GET' : 'POST');
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.status(200).end();
      return;
    }
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  let body: unknown = req.body;
  if (!body && typeof req.json === 'function') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  } else if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const typedBody = (body as RoutineRequestBody) || {};
  const persona: VulnerabilityPersona = typedBody.persona || VULNERABILITY_PERSONAS[1];
  const zone: UrbanZone = typedBody.zone || INITIAL_ZONES[0];
  const language = typedBody.language || 'en';

  const deterministic = generateDeterministicPlan(persona, zone, language);

  const keyObj: Record<string, unknown> = {
    p: persona.id,
    z: zone.zoneId,
    a: zone.aqi,
    l: language,
  };
  const cKey = hashObj(keyObj);

  const cached = cache.get(cKey);
  if (cached && Date.now() - cached.time < 300000) {
    return sendJson(200, cached.data);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    cache.set(cKey, { data: deterministic, time: Date.now() });
    return sendJson(200, deterministic);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a clinical environmental pulmonologist for AeroGuard AI.
Generate a JSON daily routine for:
Persona: ${persona.label}
Zone: ${zone.name}, AQI: ${zone.aqi}
Thermal Inversion Active: ${zone.inversion.isInversionActive}
Language: ${language}

Return ONLY valid JSON matching this schema:
{
  "personaId": "${persona.id}",
  "zoneId": "${zone.zoneId}",
  "currentAqi": ${zone.aqi},
  "advisoryHeadline": "Short clear string",
  "safeOutdoorWindow": "e.g. 1:00 PM - 3:30 PM",
  "hourlySchedule": [
    {
      "timeSlot": "string",
      "activity": "string",
      "recommendedAction": "string",
      "locationType": "indoor" | "outdoor" | "transit",
      "riskScore": "low" | "moderate" | "high" | "prohibited",
      "scientificRationale": "string",
      "impactMetric": "string"
    }
  ],
  "biomedicalSummary": "Clinical explanation of particulate avoidance",
  "modeledInhaledDoseAvoidedUg": 180
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed: unknown = JSON.parse(jsonMatch[0]);
      cache.set(cKey, { data: parsed, time: Date.now() });
      return sendJson(200, parsed);
    }
    return sendJson(200, deterministic);
  } catch {
    return sendJson(200, deterministic);
  }
}
