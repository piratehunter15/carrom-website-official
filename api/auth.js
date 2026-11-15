/**
 * Serverless Handler for Admin Authentication
 * Enforces coordinator 6-digit PIN system
 */
const COORDINATOR_PINS = {
  "Satwik": "201313",
  "Sravan": "201317",
  "Ramcharan": "201328",
  "Navaneet": "201331",
  "Chandan": "201303",
  "Abhinav": "201304"
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { username, pin } = req.body || {};

    if (!username || !pin) {
      return res.status(400).json({ success: false, message: 'Username and PIN are required.' });
    }

    const expectedPin = COORDINATOR_PINS[username];

    if (expectedPin && expectedPin === String(pin).trim()) {
      return res.status(200).json({
        success: true,
        user: {
          username: username,
          role: 'Tournament Coordinator',
          token: `fks_${Buffer.from(username + ':' + Date.now()).toString('base64')}`
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid Coordinator Username or PIN.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
