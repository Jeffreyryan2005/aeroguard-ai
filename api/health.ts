export default async function handler(_req: any, res?: any) {
  const data = {
    status: 'ok',
    platform: 'AeroGuard AI Serverless Gateway',
    timestamp: Date.now(),
  };

  if (res && typeof res.status === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
