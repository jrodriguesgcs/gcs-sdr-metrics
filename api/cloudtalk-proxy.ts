const cloudtalkHandler = async (req: any, res: any) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;
  const CLOUDTALK_API_KEY = process.env.CLOUDTALK_API_KEY;

  if (!CLOUDTALK_API_KEY) {
    return res.status(500).json({ error: 'CloudTalk API key not configured' });
  }

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Endpoint parameter required' });
  }

  try {
    const url = `https://my.cloudtalk.io/api${endpoint}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDTALK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('CloudTalk proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch from CloudTalk' });
  }
};

module.exports = cloudtalkHandler;