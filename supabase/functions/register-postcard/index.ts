import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const token = url.searchParams.get('token');

      if (!token) {
        return new Response(JSON.stringify({ error: 'token is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokenHash = await hashToken(token);

      // Lookup inventory unit by token hash
      const { data: unit, error } = await supabase
        .from('inventory_units')
        .select(`
          id, business_status, fulfillment_status, registered_at, traveler_user_id,
          card_designs!inner(title, image_front_url, countries!inner(name_pl, iso2))
        `)
        .eq('public_claim_token_hash', tokenHash)
        .maybeSingle();

      if (error || !unit) {
        return new Response(JSON.stringify({ error: 'Kartka nie znaleziona' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get traveler display name
      let travelerName: string | null = null;
      if (unit.traveler_user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, first_name')
          .eq('user_id', unit.traveler_user_id)
          .maybeSingle();
        travelerName = profile?.display_name || profile?.first_name || null;
      }

      // Check if already registered
      let recipientName: string | null = null;
      if (unit.business_status === 'registered') {
        const { data: reg } = await supabase
          .from('recipient_registrations')
          .select('recipient_name')
          .eq('inventory_unit_id', unit.id)
          .maybeSingle();
        recipientName = reg?.recipient_name || null;
      }

      const design = (unit as any).card_designs;

      return new Response(JSON.stringify({
        business_status: unit.business_status,
        fulfillment_status: unit.fulfillment_status,
        registered_at: unit.registered_at,
        traveler_name: travelerName,
        recipient_name: recipientName,
        design: {
          title: design?.title,
          image_front_url: design?.image_front_url,
          country_name: design?.countries?.name_pl,
          country_iso2: design?.countries?.iso2,
        },
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { token, recipient_name, recipient_message, recipient_email, contact_opt_in, latitude, longitude } = body;

      // Validate coordinates if provided
      if (latitude !== undefined || longitude !== undefined) {
        if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
            latitude < -90 || latitude > 90 ||
            longitude < -180 || longitude > 180) {
          return new Response(JSON.stringify({ error: 'Nieprawidłowe współrzędne geograficzne' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      if (!token || !recipient_name) {
        return new Response(JSON.stringify({ error: 'token i recipient_name są wymagane' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (recipient_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipient_email.trim())) {
          return new Response(JSON.stringify({ error: 'Nieprawidłowy format email' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      if (recipient_name.length > 100) {
        return new Response(JSON.stringify({ error: 'Imię zbyt długie (max 100)' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (recipient_message && recipient_message.length > 500) {
        return new Response(JSON.stringify({ error: 'Wiadomość zbyt długa (max 500)' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const tokenHash = await hashToken(token);

      // Fetch unit
      const { data: unit, error: fetchError } = await supabase
        .from('inventory_units')
        .select('id, business_status, fulfillment_status')
        .eq('public_claim_token_hash', tokenHash)
        .maybeSingle();

      if (fetchError || !unit) {
        return new Response(JSON.stringify({ error: 'Kartka nie znaleziona' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (unit.business_status === 'registered') {
        return new Response(JSON.stringify({ error: 'Ta kartka została już zarejestrowana' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (unit.business_status !== 'purchased') {
        return new Response(JSON.stringify({ error: 'Ta kartka nie została jeszcze aktywowana' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create registration record
      const { error: insertError } = await supabase
        .from('recipient_registrations')
        .insert({
          inventory_unit_id: unit.id,
          recipient_name: recipient_name.trim(),
          recipient_message: recipient_message?.trim() || null,
          recipient_email: recipient_email?.trim() || null,
          contact_opt_in: contact_opt_in === true,
        });

      if (insertError) {
        // Unique constraint violation = already registered
        if (insertError.code === '23505') {
          return new Response(JSON.stringify({ error: 'Ta kartka została już zarejestrowana' }), {
            status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ error: 'Nie udało się zarejestrować kartki' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update inventory unit
      const { error: updateError } = await supabase
        .from('inventory_units')
        .update({
          business_status: 'registered',
          registered_at: new Date().toISOString(),
        })
        .eq('id', unit.id);

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Nie udało się zaktualizować statusu' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
