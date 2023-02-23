import Stripe from "stripe";

export const getReadableAccountType = (account: Stripe.Account) => {
  if (account.type === "custom" || account.type === "express") {
    return account.type;
  }

  if (account.type === "standard") {
    if (!account.controller || !account.controller.is_controller) {
      return "standard nonCBSP";
    }

    /**
-   UA-1: Standard with a buy-rate, Platform Managed Risk
-   UA-2: Standard with a buy-rate
-   UA-3: “Custom” 
-   UA-4: “Express” 
-   UA-5: “Express” w/ Stripe Managed Risk 
-   UA-6: Embedded w/ Platform Managed Risk 
-   UA-7 Embedded w/ Stripe Managed Risk** Dependent on Risk. Not clear if this is in scope for 2022.**
   */

    const dashboard = account.controller.dashboard?.type;
    const platform_owns_loss_liability =
      account.controller.application?.loss_liable;
    const platform_owns_onboarding =
      account.controller.application?.onboarding_owner;
    const platform_owns_pricing =
      account.controller.application?.pricing_controls;

    if (
      dashboard === "full" &&
      !platform_owns_pricing &&
      !platform_owns_loss_liability
    ) {
      return "standard";
    }

    if (
      dashboard === "full" &&
      platform_owns_pricing &&
      platform_owns_loss_liability
    ) {
      return "UA1";
    }

    if (
      dashboard === "full" &&
      platform_owns_pricing &&
      !platform_owns_loss_liability
    ) {
      return "UA2";
    }

    if (
      dashboard === "none" &&
      platform_owns_pricing &&
      platform_owns_loss_liability
    ) {
      return "UA3 or UA6";
    }

    if (
      dashboard === "express" &&
      platform_owns_pricing &&
      platform_owns_loss_liability
    ) {
      return "UA4";
    }

    if (
      dashboard === "express" &&
      platform_owns_pricing &&
      !platform_owns_loss_liability
    ) {
      return "UA5";
    }

    if (
      dashboard === "none" &&
      platform_owns_pricing &&
      !platform_owns_loss_liability
    ) {
      return "UA7";
    }

    if (
      dashboard === undefined &&
      platform_owns_loss_liability === undefined &&
      platform_owns_pricing === undefined &&
      account.controller.is_controller
    ) {
      return "standard CBSP";
    }
  }

  return "unknown!!";
};
