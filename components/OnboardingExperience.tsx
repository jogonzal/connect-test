import * as React from "react";
import { ConnectAccountOnboarding } from "../hooks/ConnectJsTypes";

export const OnboardingExperienceExample: React.FC = () => {
  return (
    <ConnectAccountOnboarding
      onOnboardingExited={() => {
        console.log("The account has exited onboarding");
      }}
    />
  );
};
