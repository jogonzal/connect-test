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

export const featuresCache: {
  [accountId: string]: { featuresConfig: FeaturesConfig; updated: boolean };
} = {};

export type Component = keyof typeof defaultFeaturesConfig;
export type Feature = keyof typeof defaultFeaturesConfig[Component];

export function accountSessionFeaturesUpToDate(accountId: string) {
  if (!(accountId in featuresCache)) return true;
  return featuresCache[accountId].updated;
}

export function setAccountSessionFeaturesUpToDate(accountId: string) {
  if (!(accountId in featuresCache)) return;
  featuresCache[accountId].updated = true;
}

export function getAccountSessionComponentParamWithFeatures<
  T extends Stripe.AccountSessionCreateParams.Components,
>(accountId: string, defaultParam: T) {
  if (!(accountId in featuresCache)) return defaultParam;
  const param = defaultParam;
  const featuresConfig = featuresCache[accountId].featuresConfig;
  let comp: keyof FeaturesConfig;
  for (comp in featuresConfig) {
    // @ts-expect-error Property 'features' does not exist on type 'Payments | PaymentDetails'.
    param[comp].features = featuresConfig[comp];
  }
  return param;
}

export function setFeaturesConfig(
  accountId: string,
  featuresConfig: FeaturesConfig,
) {
  featuresCache[accountId] = { featuresConfig, updated: false };
}

export function clearFeaturesConfig(accountId: string) {
  if (accountId in featuresCache) {
    delete featuresCache[accountId];
  }
}
