import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      // Lookup postcard by qr_token (for displaying info before registration)
      const url = new URL(req.url);
      const qr_token = url.searchParams.get('qr_token');

      if (!qr_token) {
        return new Response(JSON.stringify({ error: 'qr_token is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: postcard, error } = await supabase
        .from('postcards')
        .select(`
          id, status, buyer_display_name, registered_at, recipient_name,
          designs!inner(view_name, image_url, countries!inner(name, flag, language_name))
        `)
        .eq('qr_token', qr_token)
        .maybeSingle();

      if (error || !postcard) {
        return new Response(JSON.stringify({ error: 'Postcard not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Never expose qr_token, buyer_id, order_reference, recipient_email
      return new Response(JSON.stringify({
        status: postcard.status,
        buyer_display_name: postcard.buyer_display_name,
        registered_at: postcard.registered_at,
        recipient_name: postcard.recipient_name,
        design: {
          view_name: (postcard as any).designs?.view_name,
          image_url: (postcard as any).designs?.image_url,
          country_name: (postcard as any).designs?.countries?.name,
          country_flag: (postcard as any).designs?.countries?.flag,
          language_name: (postcard as any).designs?.countries?.language_name,
        },
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { qr_token, recipient_name, recipient_message, recipient_email } = body;

      if (!qr_token || !recipient_name) {
        return new Response(JSON.stringify({ error: 'qr_token and recipient_name are required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (recipient_name.length > 100) {
        return new Response(JSON.stringify({ error: 'recipient_name too long (max 100)' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (recipient_message && recipient_message.length > 500) {
        return new Response(JSON.stringify({ error: 'recipient_message too long (max 500)' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch postcard
      const { data: postcard, error: fetchError } = await supabase
        .from('postcards')
        .select('id, status')
        .eq('qr_token', qr_token)
        .maybeSingle();

      if (fetchError || !postcard) {
        return new Response(JSON.stringify({ error: 'Postcard not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (postcard.status !== 'purchased') {
        const msg = postcard.status === 'registered' 
          ? 'This postcard has already been registered' 
          : 'This postcard has not been purchased yet';
        return new Response(JSON.stringify({ error: msg }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Register the postcard
      const { error: updateError } = await supabase
        .from('postcards')
        .update({
          status: 'registered',
          recipient_name,
          recipient_message: recipient_message || null,
          recipient_email: recipient_email || null,
          registered_at: new Date().toISOString(),
        })
        .eq('id', postcard.id);

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to register postcard' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update country count
      await supabase.rpc('update_country_count');

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
