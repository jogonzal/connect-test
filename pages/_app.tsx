import React from "react";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { initializeIcons } from "@fluentui/react";
import { LocaleAndThemingOptions } from "../components/LocaleAndThemingOptions";

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

  return (
    // Provide the client to your App
    <>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <ReactQueryDevtools initialIsOpen={false} />
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
