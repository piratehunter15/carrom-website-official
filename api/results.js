import { supabase } from '../lib/supabaseClient.js';

/**
 * Results API Handler for FKS Carrom Open 2027
 */

export async function handleGetResults(req, res) {
  const action = req.query.action || '';

  try {
    const { data, error } = await supabase
      .from('results')
      .select('*');

    if (error) throw error;

    const results = data.map(row => ({
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
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function handlePostResults(req, res) {
  try {
    const data = req.body || {};

    if (data.action === 'submitResult') {
      const targetEvent = String(data.Event || '').trim();
      const targetRound = String(data.Round || '').trim();
      const targetCompID = String(data.CompetitorID || '').trim();

      const { data: existing } = await supabase
        .from('results')
        .select('id')
        .eq('event', targetEvent)
        .eq('round', targetRound)
        .eq('competitor_id', targetCompID)
        .maybeSingle();

      const payload = {
        event: targetEvent,
        round: targetRound,
        rank: parseInt(data.Rank || 0, 10),
        competitor_id: targetCompID,
        name: data.Name || '',
        partner_name: data.PartnerName || '',
        grade: data.Grade || '',
        score: data.Score || '0',
        status: data.Status || 'Complete',
        station: parseInt(data.Station || 0, 10) || 0
      };

      if (existing) {
        await supabase
          .from('results')
          .update(payload)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('results')
          .insert([payload]);
      }

      return res.status(200).json({ success: true, message: 'Carrom match result saved successfully' });
    }

    return res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGetResults(req, res);
  if (req.method === 'POST') return handlePostResults(req, res);
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
