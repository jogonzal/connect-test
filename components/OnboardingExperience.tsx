import * as React from "react";
import { ConnectAccountOnboarding } from "../hooks/ConnectJsTypes";
import { Stack, TextField } from "@fluentui/react";

export const OnboardingExperienceExample: React.FC = () => {
  const [fullTos, setFullTos] = React.useState("https://www.example.com/tos");
  const [recipientTos, setRecipientTos] = React.useState(
    "https://www.example.com/recipient-tos",
  );
  const [privacyPolicy, setPrivacyPolicy] = React.useState(
    "https://www.example.com/privacy-policy",
  );
  const [skipTos, setSkipTos] = React.useState("true");

  return (
    <Stack>
      <Stack.Item>
        <Stack style={{ width: "250px" }}>
          <Stack.Item>
            <TextField
              label="Full Terms of Service"
              value={fullTos}
              onChange={(_, value) => setFullTos(value ?? "")}
            />
          </Stack.Item>
          <Stack.Item>
            <TextField
              label="Recipient Terms of Service"
              value={recipientTos}
              onChange={(_, value) => setRecipientTos(value ?? "")}
            />
          </Stack.Item>
          <Stack.Item>
            <TextField
              label="Privacy Policy"
              value={privacyPolicy}
              onChange={(_, value) => setPrivacyPolicy(value ?? "")}
            />
          </Stack.Item>
          <Stack.Item>
            <TextField
              label="Skip Terms of Service"
              value={skipTos}
              onChange={(_, value) => setSkipTos(value ?? "")}
            />
          </Stack.Item>
        </Stack>
      </Stack.Item>
      <Stack.Item>
        <ConnectAccountOnboarding
          fullTos={fullTos}
          recipientTos={recipientTos}
          privacyPolicy={privacyPolicy}
          skipTos={skipTos}
          onExit={() => {
            console.log("The account has exited onboarding");
          }}
        />
      </Stack.Item>
    </Stack>
  );
};
