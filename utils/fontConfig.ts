export type FontSource = "cssfontsource" | "customfontsource";
export type FontConfig = {
  fontFamily: string | undefined;
  fontSource: FontSource;
  cssFontSource: string | undefined;
};

export const DEFAULT_FONT_CONFIG: FontConfig = {
  fontFamily: "Grandstander",
  fontSource: "customfontsource",
  cssFontSource: undefined,
};

export const DEFAULT_CUSTOM_FONT_SOURCE = [
  {
    family: "Segoe UI",
    src: "url(https://static2.sharepointonline.com/files/fabric/assets/fonts/segoeui-westeuropean/segoeui-light.woff2)",
    weight: "100",
  },
  {
    family: "Segoe UI",
    src: "url(https://static2.sharepointonline.com/files/fabric/assets/fonts/segoeui-westeuropean/segoeui-semilight.woff2)",
    weight: "300",
  },
  {
    family: "Segoe UI",
    src: "url(https://static2.sharepointonline.com/files/fabric/assets/fonts/segoeui-westeuropean/segoeui-regular.woff2)",
    weight: "400",
  },
  {
    family: "Segoe UI",
    src: "url(https://static2.sharepointonline.com/files/fabric/assets/fonts/segoeui-westeuropean/segoeui-semibold.woff2)",
    weight: "600",
  },
  {
    family: "Segoe UI",
    src: "url(https://static2.sharepointonline.com/files/fabric/assets/fonts/segoeui-westeuropean/segoeui-bold.woff2)",
    weight: "700",
  },
];
