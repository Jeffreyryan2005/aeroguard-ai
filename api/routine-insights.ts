import { GoogleGenerativeAI } from '@google/generative-ai';
import { createHash } from 'crypto';

const cache = new Map<string, { data: any; time: number }>();

function hashObj(obj: any): string {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

function getDeterministicPlan(persona: any, zone: any) {
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

export default async function handler(req: any, res?: any) {
  const sendJson = (status: number, data: any) => {
    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(status).json(data);
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
    if (res && typeof res.status === 'function') return res.status(200).end();
    return new Response(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  let body = req.body;
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

  const { persona, zone, language = 'en' } = body || {};

  const cacheKey = hashObj({ p: persona?.id, z: zone?.zoneId, aqi: zone?.aqi, l: language });
  if (cache.has(cacheKey)) {
    return sendJson(200, cache.get(cacheKey)!.data);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const fallback = getDeterministicPlan(persona, zone);
    cache.set(cacheKey, { data: fallback, time: Date.now() });
    return sendJson(200, fallback);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are AeroGuard AI, an expert pulmonologist and atmospheric physicist.
Produce a daily schedule for:
Zone: ${zone?.name || 'City'} (AQI: ${zone?.aqi || 300}, Inversion Active: ${zone?.inversion?.isInversionActive})
Persona: ${persona?.label || 'Resident'} (VE: ${persona?.respiratoryMinuteVol || 20} L/min)
Language: ${language}

Return ONLY valid JSON matching this schema:
{
  "advisoryHeadline": "string",
  "safeOutdoorWindow": "string",
  "biomedicalSummary": "string",
  "modeledInhaledDoseAvoidedUg": 220,
  "hourlySchedule": [
    {
      "timeSlot": "07:00 AM - 09:00 AM",
      "activity": "string",
      "recommendedAction": "string",
      "locationType": "indoor",
      "riskScore": "high",
      "scientificRationale": "string",
      "impactMetric": "string"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    const finalData = {
      ...parsed,
      personaId: persona?.id || 'asthmatic',
      zoneId: zone?.zoneId || 'delhi-anand-vihar',
      currentAqi: zone?.aqi || 350,
      generatedAt: new Date().toISOString(),
      source: 'gemini-live',
    };
    cache.set(cacheKey, { data: finalData, time: Date.now() });
    return sendJson(200, finalData);
  } catch {
    const fallback = getDeterministicPlan(persona, zone);
    cache.set(cacheKey, { data: fallback, time: Date.now() });
    return sendJson(200, fallback);
  }
}
