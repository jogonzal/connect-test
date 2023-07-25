import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    res.status(200).json({ message: "Hello world" });
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    res.status(500).json({ error: errorMessage });
  }
}
