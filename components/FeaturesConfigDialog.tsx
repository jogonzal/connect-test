import {
  PrimaryButton,
  Stack,
  Dialog,
  IStackTokens,
  Checkbox,
} from "@fluentui/react";
import * as React from "react";
import {
  defaultFeaturesConfig,
  featuresCache,
  setFeaturesConfig,
} from "../utils/featuresConfigUtils";
import type {
  FeaturesConfig,
  Component,
  Feature,
} from "../utils/featuresConfigUtils";

type Props = {
  accountId: string;
  onDismiss: () => void;
  onSave: (featuresConfig: FeaturesConfig) => void;
};

function deepCopy(obj: Object) {
  return JSON.parse(JSON.stringify(obj));
}

export const FeaturesConfigDialog: React.FC<Props> = (props) => {
  const renderContent = () => {
    const tokens: IStackTokens = {
      childrenGap: "15px",
    };

    const [featuresConfigState, setFeaturesConfigState] = React.useState(
      deepCopy(
        featuresCache[props.accountId]?.featuresConfig || defaultFeaturesConfig,
      ),
    );

    return (
      <Stack tokens={tokens}>
        {Object.keys(featuresConfigState).map((c) => {
          const component = c as Component;
          return (
            <Stack tokens={tokens} key={component}>
              <Stack>{component}</Stack>
              {Object.keys(featuresConfigState[component]).map((f) => {
                const feature = f as Feature;
                return (
                  <Stack key={feature}>
                    <Checkbox
                      checked={featuresConfigState[component][feature]}
                      onChange={(_ev, val) => {
                        featuresConfigState[component][feature] = val || false;
                        setFeaturesConfigState({ ...featuresConfigState });
                      }}
                      label={feature}
                    />
                  </Stack>
                );
              })}
            </Stack>
          );
        })}
        <PrimaryButton
          onClick={() => {
            props.onSave(featuresConfigState);
            setFeaturesConfig(props.accountId, featuresConfigState);
            props.onDismiss();
          }}
        >
          Save
        </PrimaryButton>
      </Stack>
    );
  };

  return (
    <Dialog hidden={false} minWidth={600} onDismiss={props.onDismiss}>
      {renderContent()}
    </Dialog>
  );
};
