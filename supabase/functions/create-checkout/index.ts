// This file runs in Deno environment - TypeScript errors can be ignored
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, amount, currency, returnUrl } = await req.json();

    if (!planId || !amount || !currency || !returnUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: planId, amount, currency, returnUrl" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const entityId = Deno.env.get("PEACH_ENTITY_ID");
    const secretKey = Deno.env.get("PEACH_SECRET_KEY");

    if (!entityId || !secretKey) {
      console.error("Missing Peach Payments credentials in secrets");
      return new Response(
        JSON.stringify({ error: "Payment service not configured. Please add PEACH_ENTITY_ID and PEACH_SECRET_KEY secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const checkoutPayload = {
      authentication: {
        entityId,
      },
      amount: parseFloat(amount).toFixed(2),
      currency,
      shopperResultUrl: `${returnUrl}/payment/success`,
      defaultPaymentMethod: "CARD",
      merchantTransactionId: `timeline-${planId}-${Date.now()}`,
      nonce: crypto.randomUUID(),
    };

    const response = await fetch("https://testsecure.peachpayments.com/v2/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Peach Payments API error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // The hosted checkout redirect URL
    const redirectUrl = data.redirectUrl || `https://testsecure.peachpayments.com/checkout/v2/${data.checkoutId}`;

    return new Response(
      JSON.stringify({ redirectUrl, checkoutId: data.checkoutId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
