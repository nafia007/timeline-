// This file runs in Deno environment - TypeScript errors can be ignored
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    
    // Parse the webhook payload from Peach Payments
    const payload = await req.json();
    
    // Get user_id and plan_id from query params (passed during checkout creation)
    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id");
    const planId = url.searchParams.get("plan_id");

    // Extract payment information from Peach response
    const {
      transactionId,
      resultCode,
      amount,
      currency,
    } = payload;

    // Check if payment was successful
    // Peach Payments result codes: 000.000.000 = success
    const isSuccess = resultCode === "000.000.000" || resultCode === "0";

    if (isSuccess && userId && planId) {
      // Get plan details
      const { data: plan } = await supabaseAdmin
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (plan) {
        // Calculate subscription period (monthly)
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Update or create user subscription
        const { error: subError } = await supabaseAdmin
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            stripe_subscription_id: transactionId, // Using Peach transaction ID
          }, {
            onConflict: "user_id",
          });

        if (subError) {
          console.error("Error updating subscription:", subError);
        }

        // Update user profile with subscription tier
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_tier: plan.name.toLowerCase(),
            subscription_status: "active",
            subscription_expires_at: periodEnd.toISOString(),
          })
          .eq("user_id", userId);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }

        // Update pending payment status
        await supabaseAdmin
          .from("pending_payments")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("peach_transaction_id", transactionId);
      }
    } else {
      // Payment failed - update pending payment
      await supabaseAdmin
        .from("pending_payments")
        .update({
          status: "failed",
          error_message: `Result code: ${resultCode}`,
        })
        .eq("peach_transaction_id", transactionId);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
