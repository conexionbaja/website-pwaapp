import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, name, email, message } = await req.json();

    if (!type || !name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, name, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the notification (can be wired to a real email service later)
    console.log(`[NOTIFICATION] New ${type} submission:`);
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${email}`);
    if (message) console.log(`  Message: ${message}`);
    console.log(`  Timestamp: ${new Date().toISOString()}`);

    return new Response(
      JSON.stringify({ success: true, message: `Notification logged for ${type} from ${name}` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
