import { supabase } from '../lib/supabaseClient.js';

/**
 * Volunteer Directory API Handler for Carrom Open
 */

function splitList(v) {
  if (!v) return [];
  return String(v)
    .split(/[,;|\n\/]+/)
    .map(s => s.trim())
    .filter(s => {
      if (!s) return false;
      const low = s.toLowerCase();
      return low !== '-' && low !== '—' && low !== 'none' && low !== 'n/a' && low !== 'na';
    });
}

function buildVolunteer(row) {
  const name = String(row.full_name || row.Name || '').trim();
  const mobile = String(row.mobile_number || row.Mobile || '').trim();
  const grade = String(row.grade_level || row.Grade || '').trim();
  const section = String(row.section || row.Section || '').trim();
  const events = splitList(row.judging_events || row.Events || row.scramble_events);

  return {
    fullName: name,
    mobileNumber: mobile,
    grade: grade,
    section: section,
    judgingEvents: events.join(', '),
    judgingEventsList: events,
    Name: name,
    name: name,
    Mobile: mobile,
    Grade: grade,
    Section: section,
    Events: events.join(', ')
  };
}

export async function handleGetVolunteers(req, res) {
  const action = req.query.action || '';

  try {
    if (action === 'diag') {
      const { data, count, error } = await supabase
        .from('volunteers')
        .select('*', { count: 'exact' });

      if (error) throw error;

      return res.status(200).json({
        status: 'success',
        tableName: 'volunteers',
        dataRows: count || data.length,
        sampleParsedRow: data.length > 0 ? buildVolunteer(data[0]) : null,
        serverTime: new Date().toISOString()
      });
    }

    const { data, error } = await supabase
      .from('volunteers')
      .select('*');

    if (error) throw error;

    const list = data.map(buildVolunteer);
    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

export async function handlePostVolunteers(req, res) {
  try {
    const data = req.body || {};

    const name = String(data.fullName || data.name || data.Name || '').trim();
    const mobileRaw = String(data.mobileNumber || data.mobile || data.Mobile || data.phone || '').trim();
    const grade = String(data.grade || data.Grade || '').trim();
    const section = String(data.section || data.Section || '').trim();
    
    const events = Array.isArray(data.judgingEvents) ? data.judgingEvents.join(', ')
      : String(data.judgingEvents || data.events || data.Events || '').trim();

    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });
    if (!mobileRaw) return res.status(400).json({ success: false, error: 'Mobile number is required' });

    const mobileDigits = mobileRaw.replace(/\D/g, '');
    const mobileNum = parseInt(mobileDigits, 10);

    // Deduplicate on mobile number
    const { data: existing } = await supabase
      .from('volunteers')
      .select('id')
      .eq('mobile_number', mobileNum)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        duplicate: true,
        error: 'A volunteer is already registered with this mobile number.'
      });
    }

    const { error: insertErr } = await supabase
      .from('volunteers')
      .insert([{
        timestamp: new Date().toISOString(),
        full_name: name,
        mobile_number: mobileNum,
        grade_level: grade,
        section: section,
        judging_events: events
      }]);

    if (insertErr) throw insertErr;

    return res.status(200).json({
      success: true,
      fullName: name,
      mobileNumber: mobileRaw,
      grade: grade,
      section: section,
      judgingEvents: events
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGetVolunteers(req, res);
  if (req.method === 'POST') return handlePostVolunteers(req, res);
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
