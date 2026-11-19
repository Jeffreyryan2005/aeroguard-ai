import type { Request, Response } from 'express';
import { validateZone, sanitizeText } from '../server/validators';
import { getEmergencyAdvisoryText } from '../server/aiService';
import { insightCache, hashPayload, pruneCache } from '../server/cache';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { zone, language = 'en' } = req.body || {};
  if (!validateZone(zone)) {
    return res.status(400).json({ error: 'Invalid zone telemetry payload' });
  }

  const cleanLang = sanitizeText(language, 10) || 'en';
  const cacheKey = hashPayload({ type: 'advisory', zoneId: zone.zoneId, aqi: zone.aqi, cleanLang });

  if (insightCache.has(cacheKey)) {
    return res.status(200).json({ advisory: insightCache.get(cacheKey)!.data });
  }

  const advisory = await getEmergencyAdvisoryText(zone, cleanLang);
  pruneCache();
  insightCache.set(cacheKey, { data: advisory, cachedAt: Date.now() });
  return res.status(200).json({ advisory });
}
