import React from "react";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import {
  initializeIcons,
  ITheme,
  registerOnThemeChangeCallback,
} from "@fluentui/react";
import {
  LocaleAndThemingOptions,
  Theme,
  ThemeUtils,
} from "../components/LocaleAndThemingOptions";
import Spanish from "../loc/es.json";
import English from "../loc/en.json";
import { IntlProvider } from "react-intl";

registerOnThemeChangeCallback((theme: ITheme) => {
  console.log("Theme changed!");
  const root = document.getElementsByTagName("html")[0];
  root.style.backgroundColor = theme.semanticColors.bodyBackground;
  root.style.color = theme.semanticColors.bodyText;
});
export let initialLocale = "en";
if (typeof localStorage !== "undefined") {
  const theme = localStorage.getItem("theme");
  if (theme) {
    ThemeUtils.loadTheme(theme as Theme);
  }
  const locale = localStorage.getItem("locale");
  if (locale) {
    initialLocale = locale;
  }
}

// The code in this file gets included for all components!

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Disable server side rendering
  if (typeof window === "undefined") {
    return null;
  }

  let messages;
  switch (initialLocale) {
    case "es":
      messages = Spanish;
      break;
    case "en":
      messages = English;
      break;
    default:
      messages = English;
      break;
  }

  return (
    // Provide the client to your App
    <>
      <QueryClientProvider client={queryClient}>
        <IntlProvider
          locale={initialLocale}
          messages={messages}
          onError={() => null}
        >
          {/* TODO: Fix this ts-ignore */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <Component {...pageProps} />
          <ReactQueryDevtools initialIsOpen={false} />
        </IntlProvider>
      </QueryClientProvider>
      <LocaleAndThemingOptions />
    </>
  );
}

// Only run in client
if (typeof window !== "undefined") {
  initializeIcons();
}

export default MyApp;
