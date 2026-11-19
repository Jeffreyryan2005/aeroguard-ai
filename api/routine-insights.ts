import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';
import type { ExpressLikeResponse, ServerlessRequest } from './emergency-advisory';

interface RoutineRequestBody {
  persona?: {
    id?: string;
    label?: string;
    category?: string;
  };
  zone?: {
    zoneId?: string;
    name?: string;
    aqi?: number;
    inversion?: {
      isInversionActive?: boolean;
    };
  };
  language?: string;
}

const cache = new Map<string, { data: unknown; time: number }>();

function hashObj(obj: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

function getDeterministicPlan(persona?: RoutineRequestBody['persona'], zone?: RoutineRequestBody['zone']) {
  const isSevere = (zone?.aqi || 200) >= 300;
  const isInverted = zone?.inversion?.isInversionActive ?? true;

  const safeWindow = isInverted
    ? '1:00 PM - 3:30 PM (Solar Convection Peak)'
    : isSevere
    ? '12:30 PM - 2:30 PM'
    : '10:00 AM - 4:00 PM';

  const hourlySchedule = [
    {
      timeSlot: '07:00 AM - 09:00 AM',
      activity: 'Morning Commute & School Run',
      recommendedAction: isSevere
        ? 'STRICT INDOOR / CLOSED VEHICLE: Ground inversion traps diesel soot. Seal windows, run HEPA, delay non-essential school runs.'
        : 'Wear N95/FFP2 mask; avoid open-air walking along main arterial roads.',
      locationType: 'indoor',
      riskScore: isSevere ? 'prohibited' : 'high',
      scientificRationale:
        'Nocturnal boundary layer inversion concentrates ultrafine PM2.5 within 80m of asphalt. Human minute ventilation causes deep alveolar deposition.',
      impactMetric: 'Avoids ~145 µg of inhaled particulate matter',
    },
    {
      timeSlot: '09:00 AM - 12:00 PM',
      activity: 'Workplace / Study Hours',
      recommendedAction:
        'Continuous indoor filtration (target 4 ACH). Keep all external windows tightly latched; use door sweep seals.',
      locationType: 'indoor',
      riskScore: 'low',
      scientificRationale:
        'Indoor sealed spaces with active MERV-13/HEPA filtration reduce particulate concentration by 75-88% relative to ambient outdoor air.',
      impactMetric: 'Reduces indoor PM2.5 to < 35 µg/m³',
    },
    {
      timeSlot: '01:00 PM - 03:30 PM',
      activity: 'Permissible Outdoor Tasks / Aeration Window',
      recommendedAction:
        'OPTIMAL SOLAR WINDOW: Solar surface heating elevates the boundary mixing layer to 850m. Conduct brief outdoor errands or 20-min cross-ventilation purge.',
      locationType: 'outdoor',
      riskScore: isSevere ? 'moderate' : 'low',
      scientificRationale:
        'Solar thermal convection breaks the ground-level inversion cap, diluting surface particulate density by up to 40% compared to early morning peaks.',
      impactMetric: 'Optimal balance of fresh air exchange vs smog exposure',
    },
    {
      timeSlot: '04:00 PM - 07:00 PM',
      activity: 'Evening Commute & Groceries',
      recommendedAction:
        'Prefer subterranean Metro or AC electric bus with internal recirculation. Avoid open auto-rickshaws or unmasked bicycle riding.',
      locationType: 'transit',
      riskScore: isSevere ? 'high' : 'moderate',
      scientificRationale:
        'Subterranean metro systems feature specialized track ventilation and carriage filtration, lowering inhaled dose by 85% compared to road-level transit.',
      impactMetric: 'Averts 85% of traffic emissions inhalation',
    },
    {
      timeSlot: '07:00 PM - 10:00 PM',
      activity: 'Evening Relaxation & Sleep Prep',
      recommendedAction:
        'Activate bedroom Corsi-Rosenthal Box or HEPA purifier at Medium-High speed 45 minutes before sleep to achieve 4 ACH clean air decay.',
      locationType: 'indoor',
      riskScore: 'low',
      scientificRationale:
        'Sleeping in a purified room prevents nocturnal hypoxemia and airway inflammation in asthmatic and elderly occupants.',
      impactMetric: 'Maintains sleeping PM2.5 < 15 µg/m³ throughout 8 hours',
    },
  ];

  return {
    personaId: persona?.id || 'asthmatic',
    zoneId: zone?.zoneId || 'delhi-anand-vihar',
    currentAqi: zone?.aqi || 350,
    advisoryHeadline: isSevere
      ? `🚨 SEVERE SMOG ALERT: Ground Inversion Active in ${zone?.name || 'Urban Zone'}. Restrict ${persona?.label || 'Family'} to Solar Midday Window.`
      : `⚠️ Elevated Pollution in ${zone?.name || 'Urban Zone'}: Follow Inversion-Aware Schedule.`,
    safeOutdoorWindow: safeWindow,
    hourlySchedule,
    biomedicalSummary: `Targeted clinical protection for ${persona?.label || 'Vulnerable Individual'}. Given current AQI of ${zone?.aqi || 350} with active thermal inversion, following this schedule avoids approximately 180 µg of deep alveolar particulate deposition.`,
    modeledInhaledDoseAvoidedUg: 180,
    generatedAt: new Date().toISOString(),
    source: 'deterministic-fallback',
  };
}

export default async function handler(req: ServerlessRequest, res?: ExpressLikeResponse): Promise<Response | void> {
  const sendJson = (status: number, data: unknown): Response | void => {
    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(status).json(data);
      return;
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
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
  const { persona, zone, language = 'en' } = typedBody;
  const deterministic = getDeterministicPlan(persona, zone);

  const keyObj: Record<string, unknown> = {
    p: persona?.id || 'default',
    z: zone?.zoneId || 'default',
    a: zone?.aqi || 0,
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
Persona: ${persona?.label || 'General'}
Zone: ${zone?.name || 'Urban Zone'}, AQI: ${zone?.aqi || 300}
Thermal Inversion Active: ${zone?.inversion?.isInversionActive ?? true}
Language: ${language}

Return ONLY valid JSON matching this schema:
{
  "personaId": "${persona?.id || 'asthmatic'}",
  "zoneId": "${zone?.zoneId || 'delhi'}",
  "currentAqi": ${zone?.aqi || 300},
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
