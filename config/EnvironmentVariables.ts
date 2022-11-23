import dotenv from "dotenv";

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

let host = "https://jorgeconnectplatform.herokuapp.com";
// If we're in testmode, the redirect can be http, otherwise it has to be https
if (StripePrivateKey.startsWith("sk_test")) {
  host = "http://localhost:3000";
}
export const hostUrl = host;
