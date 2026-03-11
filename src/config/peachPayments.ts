// Peach Payments configuration
// Entity ID and Secret Key are stored as Supabase secrets and used in edge functions only.

export const PEACH_PAYMENTS_CONFIG = {
  // Base URL for the Peach Payments API
  apiBaseUrl: "https://testsecure.peachpayments.com",
  // Checkout endpoint
  checkoutEndpoint: "/v2/checkout",
  // Currency
  currency: "ZAR",
  // Return URLs (will be constructed dynamically based on app origin)
  getReturnUrls: (origin: string) => ({
    successUrl: `${origin}/payment/success`,
    failureUrl: `${origin}/payment/failure`,
    cancelUrl: `${origin}/payment/failure`,
  }),
} as const;
