import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { emailId } = await req.json();

    // Get the email
    const { data: email, error: emailError } = await supabase
      .from('newsletter_emails')
      .select('*')
      .eq('id', emailId)
      .single();

    if (emailError || !email) {
      return new Response(JSON.stringify({ error: 'Email not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all active subscribers
    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('active', true);

    // For now, just mark as sent. In production, integrate with an email service.
    await supabase
      .from('newsletter_emails')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', emailId);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Newsletter queued for ${subscribers?.length || 0} subscribers`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
