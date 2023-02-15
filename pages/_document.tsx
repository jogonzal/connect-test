// Instructions here: https://github.com/microsoft/fluentui/wiki/Server-side-rendering-and-browserless-testing

import * as React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { Stylesheet, resetIds } from "@fluentui/react";
// Fluent UI React (Fabric) 7 or earlier
// import { Stylesheet, resetIds } from 'office-ui-fabric-react';

const stylesheet = Stylesheet.getInstance();

import ReactGA from "react-ga";
const TRACKING_ID = "G-3VRXDQ7XJQ"; // OUR_TRACKING_ID
ReactGA.initialize(TRACKING_ID);

type Props = {
  styleTags: any;
  serializedStylesheet: any;
};

// Now set up the document, and just reset the stylesheet.
export default class MyDocument extends Document<Props> {
  static getInitialProps({ renderPage }: any): any {
    resetIds();

    // eslint-disable-next-line react/display-name
    const page = renderPage((App: any) => (props: any) => <App {...props} />);

    return {
      ...page,
      styleTags: stylesheet.getRules(true),
      serializedStylesheet: stylesheet.serialize(),
    };
  }

  render() {
    return (
      <Html>
        <Head>
          <style
            type="text/css"
            dangerouslySetInnerHTML={{ __html: this.props.styleTags }}
          />
          {/*<!--
            This is one example on how to pass the data.
            The main purpose is to set the config before the Stylesheet gets initialized on the client.
            Use whatever method works best for your setup to achieve that.
          --> */}
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
            window.FabricConfig = window.FabricConfig || {};
            window.FabricConfig.serializedStylesheet = ${this.props.serializedStylesheet};
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
