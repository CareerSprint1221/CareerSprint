export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not found in environment' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 }
      })
    });

    const text = await response.text();
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Gemini returned ${response.status}`,
        details: text
      });
    }

    const data = JSON.parse(text);
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!result) {
      return res.status(500).json({ 
        error: 'No result from Gemini',
        raw: data 
      });
    }

    return res.status(200).json({ result });

  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
