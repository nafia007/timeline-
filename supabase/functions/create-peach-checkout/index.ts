// This file runs in Deno environment - TypeScript errors can be ignored
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const peachMerchantId = Deno.env.get("PEACH_MERCHANT_ID")!;
const peachApiKey = Deno.env.get("PEACH_API_KEY")!;
const peachEnvironment = Deno.env.get("PEACH_ENVIRONMENT") || "sandbox"; // sandbox or live
const webhookSecret = Deno.env.get("PEACH_WEBHOOK_SECRET")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const peachBaseUrl = peachEnvironment === "sandbox" 
  ? "https://sandbox.peachpayments.com" 
  : "https://checkout.peachpayments.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authorization header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    // Verify user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { planId, planName, amount, currency = "ZAR" } = await req.json();

    // Create checkout session/integration ID
    const checkoutData = {
      merchantId: peachMerchantId,
      currency: currency,
      amount: amount, // Amount in cents
      callbackUrl: `${req.headers.get("origin")}/subscription/success?user_id=${user.id}&plan_id=${planId}`,
      cancelUrl: `${req.headers.get("origin")}/subscription/cancel`,
      notifyUrl: `${supabaseUrl}/functions/v1/peach-webhook?user_id=${user.id}&plan_id=${planId}`,
      customer: {
        email: user.email,
      },
      merchantTransactionId: `${user.id}_${Date.now()}`,
      billingAddress: {
        // Will be collected on Peach checkout
      },
    };

    // Create payment session with Peach Payments
    const peachResponse = await fetch(`${peachBaseUrl}/v2/checkout`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(peachMerchantId + ":" + peachApiKey)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    const peachResult = await peachResponse.json();

    if (!peachResult.redirect || !peachResult.redirect.url) {
      throw new Error("Failed to create Peach checkout session");
    }

    // Store pending payment in database
    const { error: insertError } = await supabaseAdmin
      .from("pending_payments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        peach_transaction_id: peachResult.id || peachResult.transactionId,
        amount: amount,
        currency: currency,
        status: "pending",
      });

    if (insertError) {
      console.error("Error storing pending payment:", insertError);
    }

    return new Response(JSON.stringify({ 
      url: peachResult.redirect.url,
      checkoutId: peachResult.id || peachResult.transactionId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
