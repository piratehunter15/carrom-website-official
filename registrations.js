import { supabase } from '../lib/supabaseClient.js';

/**
 * Serverless Handler for Tournament Registrations
 * GET  /api/registrations - Retrieve paid or all registered students
 * POST /api/registrations - Register a student or update payment
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      // Action: Cash payment confirmation by Chandan or Navaneet
      if (body.action === 'markPaid') {
        const { id, collector } = body;
        const { data, error } = await supabase
          .from('registrations')
          .update({
            payment_status: 'Paid',
            cash_collector: collector || 'Chandan / Navaneet',
            payment_date: new Date().toISOString()
          })
          .eq('id', id)
          .select();

        if (error) throw error;
        return res.status(200).json({ success: true, registration: data[0] });
      }

      // Standard Registration Submission
      const { name, grade, section, mobileNumber, events, partnerName, totalFee } = body;

      if (!name || !grade || !section || !events) {
        return res.status(400).json({ success: false, error: 'Missing mandatory registration fields' });
      }

      const { data, error } = await supabase
        .from('registrations')
        .insert([{
          name: name.trim(),
          grade: grade.trim(),
          section: section.trim(),
          mobile_number: mobileNumber ? mobileNumber.trim() : null,
          events: events.trim(),
          partner_name: partnerName ? partnerName.trim() : null,
          total_fee: Number(totalFee) || 0,
          payment_status: 'Pending'
        }])
        .select();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        registrationId: data[0].id.substring(0, 8).toUpperCase(),
        registration: data[0]
      });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('Registration API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
