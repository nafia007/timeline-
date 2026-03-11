// This file runs in Deno environment - TypeScript errors can be ignored
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    console.log("Payment webhook received:", JSON.stringify(body));

    // Extract payment result details
    const {
      checkoutId,
      merchantTransactionId,
      result,
      amount,
      currency,
      paymentType,
    } = body;

    const resultCode = result?.code;
    const resultDescription = result?.description;

    console.log(`Payment ${checkoutId}: ${resultCode} - ${resultDescription}`);
    console.log(`Transaction: ${merchantTransactionId}, Amount: ${amount} ${currency}, Type: ${paymentType}`);

    // Successful payment codes start with "000."
    const isSuccess = resultCode?.startsWith("000.");

    if (isSuccess) {
      console.log(`✅ Payment successful for ${merchantTransactionId}`);
      // TODO: Activate subscription in database
    } else {
      console.log(`❌ Payment failed for ${merchantTransactionId}: ${resultDescription}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
