import * as React from "react";
import { ConnectAccountOnboarding } from "../hooks/ConnectJsTypes";

export const OnboardingExperienceExample: React.FC = () => {
  const [accountOnboarded, setAccountOnboarded] =
    React.useState<boolean>(false);
  const [chargesEnabled, setChargesEnabled] = React.useState<boolean>(false);

  if (accountOnboarded) {
    return (
      <p>
        The account has onboarded! Charges enabled:{" "}
        {chargesEnabled ? "true" : "false"}
      </p>
    );
  }

  const onOnboardingExited = () => {
    setAccountOnboarded(true);
    setChargesEnabled(true);
  };

  return <ConnectAccountOnboarding onOnboardingExited={onOnboardingExited} />;
};
