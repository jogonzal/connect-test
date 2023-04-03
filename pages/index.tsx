import { initializeIcons } from "@fluentui/react";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "../components/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Connect test platform</title>
        <link rel="icon" href="/favicon.ico" />
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
        {/* // Color to test */}
        <style
          dangerouslySetInnerHTML={{
            __html: ":root {--jorgecolor: #FF00FF;}",
          }}
        />
      </Head>

      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </div>
  );
};

// Only run in client
if (typeof window !== "undefined") {
  initializeIcons();
}

export default Home;
