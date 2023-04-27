import { ConnectAccountOnboarding } from "@stripe/react-connect-js";
import * as React from "react";

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

  const onOnboardingComplete = () => {
    setAccountOnboarded(true);
    setChargesEnabled(true);
  };

  return (
    <ConnectAccountOnboarding onOnboardingComplete={onOnboardingComplete} />
  );
};
