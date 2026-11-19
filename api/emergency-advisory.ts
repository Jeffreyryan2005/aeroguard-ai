import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { zone, language = 'en' } = body || {};
  const fallback = `EMERGENCY SMOG ADVISORY (${zone?.name || 'Urban Zone'}): AQI has reached ${zone?.aqi || 380}. Nocturnal thermal inversion is trapping fine particulates at ground level. Vulnerable family members must stay indoors with HEPA air purification and avoid physical exertion until solar convection breakup midday.`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(200).json({ advisory: fallback });
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Write an official 3-sentence emergency smog public health advisory for ${zone?.name || 'City'} where AQI is ${zone?.aqi || 380} with active ground thermal inversion. Language: ${language}. Plain text only.`;
    const response = await model.generateContent(prompt);
    return res.status(200).json({ advisory: response.response.text().trim() });
  } catch {
    return res.status(200).json({ advisory: fallback });
  }
}
