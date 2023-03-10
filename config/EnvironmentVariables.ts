import dotenv from "dotenv";
import { NextApiRequest } from "next";

if (process.env.NODE_ENV !== "production") {
  console.log("Loading environment variables from .env");
  dotenv.config();
} else {
  console.log("Not loading environment variables from env");
}

if (!process.env.mongo_connection_string) {
  throw new Error("Mongo connection string env variable not present");
}
export const MongoConnectionString = process.env.mongo_connection_string;

if (!process.env.stripe_private_key) {
  throw new Error("Stripe private key not present");
}
export const StripePrivateKey = process.env.stripe_private_key;

let isTestMode = false;
// If we're in testmode, the redirect can be http, otherwise it has to be https
if (StripePrivateKey.startsWith("sk_test")) {
  isTestMode = true;
}
export const getHostUrl = (request: NextApiRequest) => {
  if (!request.headers.origin) {
    return "https://connecttest.onrender.com";
  }

  console.log("Testmode is ", isTestMode);

  const url = new URL(request.headers.origin);
  return isTestMode
    ? `${url.protocol}//${url.host}`
    : "https://connecttest.onrender.com/";
};
