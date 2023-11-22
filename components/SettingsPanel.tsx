import {
  PrimaryButton,
  Stack,
  StackItem,
  Text,
  Checkbox,
  DefaultButton,
  Panel,
  PanelType,
  Dropdown,
  Separator,
  TextField,
} from "@fluentui/react";
import { Theme } from "./LocaleAndThemingOptions";
import * as React from "react";
import { defaultFeaturesConfig } from "../utils/featuresConfigUtils";
import type { Component, Feature } from "../utils/featuresConfigUtils";
import {
  ConnectJSSource,
  getConnectJSSourceInStorage,
  getFeaturesConfigInStorage,
  getLocaleInStorage,
  getThemeInStorage,
  resetFeaturesConfigInStorage,
  setConnectJSSourceInStorage,
  setConnectJsSpecificCommitInStorage,
  setFeaturesConfigInStorage,
  setLocaleInStorage,
  setThemeInStorage,
  getConnectJsFontConfig,
  setConnectJsFontConfig,
} from "../clientsStorage/LocalStorageEntry";
import { ThemeUtils } from "./LocaleAndThemingOptions";
import {
  FontConfig,
  FontSource,
  DEFAULT_FONT_CONFIG,
} from "../utils/fontConfig";

type Props = {
  onDismiss: () => void;
};

function deepCopy(obj: Object) {
  return JSON.parse(JSON.stringify(obj));
}

export const SettingsPanel: React.FC<Props> = (props) => {
  const [featuresConfigState, setFeaturesConfigState] = React.useState(
    getFeaturesConfigInStorage() || deepCopy(defaultFeaturesConfig),
  );

  const [currentTheme, setCurrentTheme] = React.useState<Theme>(
    getThemeInStorage(),
  );
  const [currentLocale, setCurrentLocale] = React.useState<string>(
    getLocaleInStorage(),
  );
  const [currentConnectJSSource, setCurrentConnectJSSource] =
    React.useState<string>(getConnectJSSourceInStorage());

  const [currentFontConfig, setCurrentFontConfig] = React.useState<FontConfig>(
    getConnectJsFontConfig() || deepCopy(DEFAULT_FONT_CONFIG),
  );

  const renderAccountSessionFeatures = () => {
    return (
      <Stack
        tokens={{
          childrenGap: "6px",
        }}
      >
        <StackItem>
          <Text variant="mediumPlus">Account session features</Text>
        </StackItem>
        {Object.keys(featuresConfigState).map((c) => {
          const component = c as Component;
          return (
            <Stack
              tokens={{
                childrenGap: "5px",
              }}
              key={component}
            >
              <StackItem>
                <Text variant="large">{component}</Text>
              </StackItem>
              {Object.keys(featuresConfigState[component]).map((f) => {
                const feature = f as Feature;
                return (
                  <StackItem key={feature}>
                    <Checkbox
                      checked={featuresConfigState[component][feature]}
                      onChange={(_ev, val) => {
                        featuresConfigState[component][feature] = val || false;
                        setFeaturesConfigState({ ...featuresConfigState });
                      }}
                      label={feature}
                    />
                  </StackItem>
                );
              })}
            </Stack>
          );
        })}
        <Stack horizontal>
          <PrimaryButton
            onClick={() => {
              setFeaturesConfigInStorage(featuresConfigState);
              window.location.reload();
            }}
          >
            Save
          </PrimaryButton>
          <DefaultButton
            onClick={() => {
              resetFeaturesConfigInStorage();
              window.location.reload();
            }}
          >
            Reset
          </DefaultButton>
        </Stack>
      </Stack>
    );
  };

  return (
    <Panel
      isLightDismiss={true}
      isOpen={true}
      onDismiss={props.onDismiss}
      type={PanelType.medium}
    >
      <Stack tokens={{ childrenGap: "20px" }}>
        <StackItem>
          <Stack tokens={{ childrenGap: "20px" }}>
            <StackItem>
              <Dropdown
                label="Theme"
                options={[
                  {
                    key: "Light",
                    text: "Light",
                  },
                  {
                    key: "Dark",
                    text: "Dark",
                  },
                ]}
                selectedKey={currentTheme}
                onChange={(_ev, item) => {
                  const newTheme = item?.key as Theme;
                  setCurrentTheme(newTheme);
                  setThemeInStorage(newTheme);
                  ThemeUtils.loadTheme(newTheme);
                  window.location.reload();
                }}
              />
              <Separator />
            </StackItem>
            <StackItem>
              <Dropdown
                label="Locale"
                options={[
                  {
                    key: "en",
                    text: "en",
                  },
                  {
                    key: "es",
                    text: "es",
                  },
                ]}
                selectedKey={currentLocale}
                onChange={(_ev, item) => {
                  const newLocale = item?.key as string;
                  setCurrentLocale(newLocale);
                  setLocaleInStorage(newLocale);
                  window.location.reload();
                }}
              />
              <Separator />
            </StackItem>
            <StackItem>
              <Dropdown
                label="Connect JS source"
                style={{ width: "150px" }}
                options={[
                  {
                    key: "local",
                    text: "local",
                  },
                  {
                    key: "prodv0.1",
                    text: "prodv0.1",
                  },
                  {
                    key: "prodv1.0",
                    text: "prodv1.0",
                  },
                  {
                    key: "bstripecdn",
                    text: "b.stripecdn (prod)",
                  },
                  {
                    key: "specificcommit",
                    text: "Specific commit",
                  },
                ]}
                selectedKey={currentConnectJSSource}
                onChange={(_ev, item) => {
                  const newSource = item?.key as ConnectJSSource;

                  if (newSource === "specificcommit") {
                    const specificCommit = window.prompt(
                      "Enter specific commit hash. NOTE: The commit has to be a commit in `master` and a commit that has previously been deployed to `submerchant-surfaces-statics-srv`.",
                    );
                    if (!specificCommit) {
                      throw new Error("Need commit");
                    }
                    setConnectJsSpecificCommitInStorage(specificCommit);
                  }

                  setCurrentConnectJSSource(newSource);
                  setConnectJSSourceInStorage(newSource);

                  window.location.reload();
                }}
              />
              <Separator />
            </StackItem>
            <StackItem
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Text variant="mediumPlus">Font config</Text>
              <Stack>
                <TextField
                  label="Font family"
                  style={{ width: "100%" }}
                  placeholder="Enter a valid font family"
                  disabled={currentFontConfig.fontSource === "customfontsource"}
                  value={currentFontConfig.fontFamily || ""}
                  onChange={(_ev, val) => {
                    setCurrentFontConfig((prev) => ({
                      ...prev,
                      fontFamily: val,
                    }));
                  }}
                />
                <Dropdown
                  label="Font source"
                  style={{ width: "150px" }}
                  options={[
                    {
                      key: "customfontsource",
                      text: "CustomFontSource",
                    },
                    {
                      key: "cssfontsource",
                      text: "CSSFontSource",
                    },
                  ]}
                  selectedKey={currentFontConfig.fontSource}
                  onChange={(_ev, item) => {
                    const newSource = item?.key as FontSource;
                    setCurrentFontConfig((prev) => ({
                      ...prev,
                      // For custom fonts, since we are loading by local files, we use a hardcoded file value
                      ...(newSource === "customfontsource"
                        ? {
                            fontFamily: "Segoe UI",
                          }
                        : {}),
                      fontSource: newSource,
                    }));
                  }}
                />
                <TextField
                  label="CSSFontSource"
                  style={{ width: "100%" }}
                  placeholder="Enter a URL pointing to a CSS file, e.g. https://fonts.googleapis.com/css?family=Open+Sans"
                  disabled={currentFontConfig.fontSource === "customfontsource"}
                  value={currentFontConfig.cssFontSource || ""}
                  onChange={(_ev, val) => {
                    setCurrentFontConfig((prev) => ({
                      ...prev,
                      cssFontSource: val,
                    }));
                  }}
                />
              </Stack>
              <PrimaryButton
                style={{
                  width: "fit-content",
                }}
                onClick={() => {
                  setConnectJsFontConfig(currentFontConfig);
                  window.location.reload();
                }}
              >
                Apply
              </PrimaryButton>
              <Separator />
            </StackItem>
          </Stack>
        </StackItem>
        <StackItem>{renderAccountSessionFeatures()}</StackItem>
      </Stack>
    </Panel>
  );
};
