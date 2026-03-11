export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  highlighted?: boolean;
}

export const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 49,
    currency: "ZAR",
    interval: "month",
    features: [
      "SD streaming quality",
      "Watch on 1 device",
      "Limited library access",
      "Cancel anytime",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 99,
    currency: "ZAR",
    interval: "month",
    highlighted: true,
    features: [
      "Full HD streaming",
      "Watch on 2 devices",
      "Full library access",
      "Offline downloads",
      "Cancel anytime",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 149,
    currency: "ZAR",
    interval: "month",
    features: [
      "4K Ultra HD + HDR",
      "Watch on 4 devices",
      "Full library + early access",
      "Offline downloads",
      "Dolby Atmos audio",
      "Cancel anytime",
    ],
  },
];
