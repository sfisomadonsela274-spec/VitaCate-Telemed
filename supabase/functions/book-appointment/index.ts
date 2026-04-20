import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const { doctor_id, date, time, reason } = await req.json();
    const authHeader = req.headers.get('Authorization')!;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const dateObj = date ? new Date(date) : new Date();
    const slotTime = time || null;

    // Enforce 06:00–20:00
    if (slotTime) {
      const [h] = slotTime.split(':').map(Number);
      if (h < 6 || h >= 20) {
        return new Response(JSON.stringify({ error: 'Appointments must be between 06:00 and 20:00' }), {
          status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // Auto-scheduling: find next available 90-min slot
    let finalTime = slotTime || '06:00:00';
    const dateStr = dateObj.toISOString().split('T')[0];

    if (!slotTime) {
      const { data: existing } = await supabaseAdmin
        .from('appointments')
        .select('time')
        .eq('doctor_id', doctor_id)
        .eq('date', dateStr)
        .order('time', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        const [lh, lm] = existing[0].time.split(':').map(Number);
        const lastMinutes = lh * 60 + lm + 90;
        if (lastMinutes < 20 * 60) {
          const nh = Math.floor(lastMinutes / 60);
          const nm = lastMinutes % 60;
          finalTime = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:00`;
        } else {
          // Next day
          dateObj.setDate(dateObj.getDate() + 1);
          finalTime = '06:00:00';
        }
      }
    }

    // Conflict check
    const { data: conflict } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctor_id)
      .eq('date', dateStr)
      .eq('time', finalTime)
      .limit(1);

    if (conflict && conflict.length > 0) {
      return new Response(JSON.stringify({ error: 'Slot already booked' }), {
        status: 409, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Get doctor name
    const { data: doctor } = await supabaseAdmin
      .from('doctors')
      .select('full_name')
      .eq('id', doctor_id)
      .single();

    const { data: appt, error: insertError } = await supabaseAdmin
      .from('appointments')
      .insert({
        doctor_id,
        patient_id: user.id,
        doctor_name: doctor?.full_name ?? doctor_id,
        date: dateStr,
        time: finalTime,
        reason: reason ?? ''
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({ appointment: appt, suggested_time: finalTime }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
