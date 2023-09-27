import Stripe from "stripe";

export const defaultFeaturesConfig = {
  payments: {
    refund_management: true,
    dispute_management: true,
    capture_payments: true,
  },
  payment_details: {
    refund_management: true,
    dispute_management: true,
    capture_payments: true,
  },
};

export type FeaturesConfig = typeof defaultFeaturesConfig;
export type Component = keyof typeof defaultFeaturesConfig;
export type Feature = keyof typeof defaultFeaturesConfig[Component];

export function getAccountSessionComponentParamWithFeatures<
  T extends Stripe.AccountSessionCreateParams.Components,
>(defaultParam: T, featuresConfig: FeaturesConfig | undefined) {
  if (featuresConfig === undefined) return defaultParam;
  const param = defaultParam;
  let comp: keyof FeaturesConfig;
  for (comp in featuresConfig) {
    // @ts-expect-error Property 'features' does not exist on type 'Payments | PaymentDetails'.
    param[comp].features = featuresConfig[comp];
  }
  return param;
}
