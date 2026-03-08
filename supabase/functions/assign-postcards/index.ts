import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Validate webhook secret
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
    
    if (!expectedSecret || webhookSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    const { order_reference, buyer_id, buyer_display_name, items } = body;

    // items: [{ design_id: string, quantity: number }]
    if (!order_reference || !buyer_id || !buyer_display_name || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Missing required fields: order_reference, buyer_id, buyer_display_name, items' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const assignedPostcards: string[] = [];

    for (const item of items) {
      const { design_id, quantity } = item;
      if (!design_id || !quantity || quantity < 1) continue;

      // Find available postcards for this design
      const { data: available, error: fetchError } = await supabase
        .from('postcards')
        .select('id')
        .eq('design_id', design_id)
        .eq('status', 'available')
        .limit(quantity);

      if (fetchError || !available || available.length < quantity) {
        return new Response(JSON.stringify({ 
          error: `Not enough available postcards for design ${design_id}. Requested: ${quantity}, Available: ${available?.length || 0}` 
        }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const ids = available.map(p => p.id);

      // Assign postcards
      const { error: updateError } = await supabase
        .from('postcards')
        .update({
          status: 'purchased',
          buyer_id,
          buyer_display_name,
          purchased_at: new Date().toISOString(),
          order_reference,
        })
        .in('id', ids);

      if (updateError) {
        return new Response(JSON.stringify({ error: `Failed to assign postcards: ${updateError.message}` }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      assignedPostcards.push(...ids);
    }

    // Fetch assigned postcards with their QR tokens for the response
    const { data: assigned } = await supabase
      .from('postcards')
      .select('id, qr_token, design_id, serial_number')
      .in('id', assignedPostcards);

    // Update country count
    await supabase.rpc('update_country_count');

    return new Response(JSON.stringify({ 
      success: true, 
      assigned_count: assignedPostcards.length,
      postcards: assigned,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
