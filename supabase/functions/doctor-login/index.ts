import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESERVED_LICENSE_NUMBERS = new Set([
  'VIT-2024-001', 'VIT-2024-002', 'VIT-2024-003',
  'VIT-2024-004', 'VIT-2024-005'
]);

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
    const { email, password, license_number } = await req.json();

    if (!email || !password || !license_number) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify doctor exists with that license_number
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('email', email)
      .eq('license_number', license_number)
      .single();

    if (doctorError || !doctor) {
      return new Response(JSON.stringify({ error: 'Doctor not found or license mismatch' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sign in via Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email, password
    });

    if (signInError) {
      return new Response(JSON.stringify({ error: 'Incorrect password' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      session: authData.session,
      doctor: { id: doctor.id, full_name: doctor.full_name, email: doctor.email, license: doctor.license_number }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
});
