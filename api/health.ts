export interface ExpressLikeResponse {
  status: (code: number) => ExpressLikeResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end?: () => void;
}

export default async function handler(_req?: unknown, res?: ExpressLikeResponse): Promise<Response | void> {
  const data = {
    status: 'ok',
    platform: 'AeroGuard AI Serverless Gateway',
    timestamp: Date.now(),
  };

  if (res && typeof res.status === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
    return;
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
