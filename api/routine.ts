import type { Request, Response } from 'express';
import { validateZone, validatePersona, sanitizeText } from '../server/validators';
import { getAiRoutineInsights } from '../server/aiService';
import { insightCache, hashPayload, pruneCache } from '../server/cache';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { persona, zone, language = 'en' } = req.body || {};
  if (!validateZone(zone)) {
    return res.status(400).json({ error: 'Invalid zone telemetry payload' });
  }
  if (!validatePersona(persona)) {
    return res.status(400).json({ error: 'Invalid persona profile payload' });
  }

  const cleanLang = sanitizeText(language, 10) || 'en';
  const cacheKey = hashPayload({ personaId: persona.id, zoneId: zone.zoneId, aqi: zone.aqi, cleanLang });

  if (insightCache.has(cacheKey)) {
    return res.status(200).json(insightCache.get(cacheKey)!.data);
  }

  const result = await getAiRoutineInsights(persona, zone, cleanLang);
  pruneCache();
  insightCache.set(cacheKey, { data: result, cachedAt: Date.now() });
  return res.status(200).json(result);
}
