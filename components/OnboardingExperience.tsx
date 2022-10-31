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

  const onOnboardingComplete = (chargesEnabled: boolean) => {
    setAccountOnboarded(true);
    setChargesEnabled(chargesEnabled);
  };

  return <OnboardingExperience onOnboardingComplete={onOnboardingComplete} />;
};

type Props = {
  onOnboardingComplete: (chargesEnabled: boolean) => void;
};

const OnboardingExperience: React.FC<Props> = ({ onOnboardingComplete }) => {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    const current = ref.current;
    const handleOnboardingCompleteEvent = (ev: Event) => {
      const customEvent = ev as CustomEvent;
      onOnboardingComplete(!!customEvent.detail.chargesEnabled);
    };
    current.addEventListener(
      "onboardingcomplete",
      handleOnboardingCompleteEvent,
    );

    return () => {
      current.removeEventListener(
        "onboardingcomplete",
        handleOnboardingCompleteEvent,
      );
    };
  }, [ref, onOnboardingComplete]);

  return <stripe-account-onboarding-experience ref={ref} />;
};
