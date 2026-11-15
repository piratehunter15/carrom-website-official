import { supabase } from '../lib/supabaseClient.js';

/**
 * Serverless Handler for Volunteers and News Broadcasts
 * GET  /api/volunteers - Fetch volunteers and notices
 * POST /api/volunteers - Register a volunteer or post a news bulletin
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action } = req.query;

    if (req.method === 'GET') {
      if (action === 'notices') {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }

      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      // Action: Publish Broadcast Notice (from Volunteer News Editor)
      if (body.action === 'publishNotice') {
        const { title, content, priority, author } = body;
        const { data, error } = await supabase
          .from('notices')
          .insert([{
            title: title.trim(),
            content: content.trim(),
            priority: priority || 'Standard',
            author: author || 'Admin Secretariat'
          }])
          .select();
        if (error) throw error;
        return res.status(201).json({ success: true, notice: data[0] });
      }

      // Volunteer Application Submission
      const { fullName, grade, section, mobileNumber, judgingEvents } = body;
      const { data, error } = await supabase
        .from('volunteers')
        .insert([{
          full_name: fullName.trim(),
          grade: grade.trim(),
          section: section.trim(),
          mobile_number: mobileNumber.trim(),
          judging_events: Array.isArray(judgingEvents) ? judgingEvents.join(', ') : String(judgingEvents || '')
        }])
        .select();

      if (error) throw error;
      return res.status(201).json({ success: true, volunteer: data[0] });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('Volunteers API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
