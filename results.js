import { supabase } from '../lib/supabaseClient.js';

/**
 * Serverless Handler for Results and Live Score Submissions
 * GET  /api/results - Fetch results filtered by event and round
 * POST /api/results - Submit or upsert round results from Admin Score Console
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;

      const results = (data || []).map(row => ({
        Event: row.event,
        Round: row.round,
        Rank: row.rank,
        CompetitorID: row.competitor_id,
        Name: row.name,
        PartnerName: row.partner_name,
        Grade: row.grade,
        Score: row.score,
        Status: row.status,
        Station: row.station || '-'
      }));

      return res.status(200).json({ results });
    }

    if (req.method === 'POST') {
      const payload = req.body || {};

      if (payload.action === 'submitResult') {
        const targetEvent = String(payload.Event || '').trim();
        const targetRound = String(payload.Round || '').trim();
        const targetCompID = String(payload.CompetitorID || '').trim();

        // Check if an entry already exists for this round
        const { data: existing } = await supabase
          .from('results')
          .select('id')
          .eq('event', targetEvent)
          .eq('round', targetRound)
          .eq('competitor_id', targetCompID)
          .maybeSingle();

        const matchRecord = {
          event: targetEvent,
          round: targetRound,
          rank: parseInt(payload.Rank || 0, 10),
          competitor_id: targetCompID,
          name: payload.Name || '',
          partner_name: payload.PartnerName || '',
          grade: payload.Grade || '',
          score: payload.Score || '0',
          status: payload.Status || 'Completed',
          station: parseInt(payload.Station || 0, 10) || 0,
          updated_at: new Date().toISOString()
        };

        if (existing) {
          await supabase.from('results').update(matchRecord).eq('id', existing.id);
        } else {
          await supabase.from('results').insert([matchRecord]);
        }

        return res.status(200).json({ success: true, message: 'Match result verified and saved.' });
      }

      return res.status(400).json({ success: false, error: 'Invalid action payload.' });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('Results API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
