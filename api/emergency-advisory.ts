import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExpressLikeResponse {
  status: (code: number) => ExpressLikeResponse;
  json: (data: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

export interface ServerlessRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  json?: () => Promise<unknown>;
}

interface AdvisoryRequestBody {
  zone?: {
    name?: string;
    aqi?: number;
  };
  language?: string;
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

  const typedBody = (body as AdvisoryRequestBody) || {};
  const { zone, language = 'en' } = typedBody;
  const fallback = `EMERGENCY SMOG ADVISORY (${zone?.name || 'Urban Zone'}): AQI has reached ${zone?.aqi || 380}. Nocturnal thermal inversion is trapping fine particulates at ground level. Vulnerable family members must stay indoors with HEPA air purification and avoid physical exertion until solar convection breakup midday.`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return sendJson(200, { advisory: fallback });
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Write an official 3-sentence emergency smog public health advisory for ${zone?.name || 'City'} where AQI is ${zone?.aqi || 380} with active ground thermal inversion. Language: ${language}. Plain text only.`;
    const response = await model.generateContent(prompt);
    return sendJson(200, { advisory: response.response.text().trim() });
  } catch {
    return sendJson(200, { advisory: fallback });
  }
}
