import type { Request, Response } from 'express';
import { insightCache } from '../server/cache';

export default function handler(_req: Request, res: Response) {
  return res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: Date.now(),
    cacheEntries: insightCache.size,
  });
}
