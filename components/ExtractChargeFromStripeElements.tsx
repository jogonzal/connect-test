import { PrimaryButton, TextField } from "@fluentui/react";
import * as React from "react";

export const ExtractChargeFromStripeElements: React.FC = () => {
  const [textContent, setTextContent] = React.useState<string | undefined>(
    undefined,
  );

  const extractFirstChargeInfo = () => {
    const rows = [
      ...(document
        .getElementsByTagName("stripe-payments-experience")[0]
        ?.shadowRoot?.querySelectorAll(
          '[data-testid="Payments-table-first-row"]',
        ) || []),
    ];
    const stuff = rows[0].textContent;
    setTextContent(JSON.stringify(stuff));
  };

  return (
    <>
      <PrimaryButton onClick={extractFirstChargeInfo}>
        Extract first charge info
      </PrimaryButton>
      {textContent && (
        <TextField multiline rows={5} readOnly value={textContent}></TextField>
      )}
    </>
  );
};
