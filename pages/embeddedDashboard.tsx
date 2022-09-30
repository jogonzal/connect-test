import { initializeIcons } from "@fluentui/react";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "../components/App";
import { EmbeddedDashboard } from "../components/EmbeddedDashboard";

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
        <title>Jorge test platform - account</title>
        <link rel="icon" href="/favicon.ico" />
        <script
          async
          src="https://b.stripecdn.com/connect-js/v0.1/connect.js"
        ></script>
      </Head>

      <QueryClientProvider client={queryClient}>
        <EmbeddedDashboard />
      </QueryClientProvider>
    </div>
  );
};

// Only run in client
if (typeof window !== "undefined") {
  initializeIcons();
}

export default Home;
