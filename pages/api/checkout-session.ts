/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { NextApiRequest, NextApiResponse } from "next";
import { Stripe } from "stripe";
import { getHostUrl } from "../../config/EnvironmentVariables";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const searchParams = new URLSearchParams(req.url!.split("?")[1]);
    const connectedAccountId: string = searchParams.get("connectedAccountId")!;
    const productName: string = searchParams.get("productName")!;
    const amount: number = parseInt(searchParams.get("amount")!);
    const applicationFee: number = parseInt(
      searchParams.get("applicationFee")!,
    );
    const destinationCharge: string = searchParams.get("destinationCharge")!;
    const useTransferAmount: string = searchParams.get("useTransferAmount")!;
    const useOBO: string = searchParams.get("useOBO")!;
    const currency = "usd";
    const quantity = 1;

    const isDestinationCharge = destinationCharge === "true";
    const isUseTransferAmount = useTransferAmount === "true";
    const isUseOBO = useOBO === "true";
    const isUseCustomer = true;
    console.log("Destination charge is...", isDestinationCharge);
    console.log("Using transfer amount...", isUseTransferAmount);
    console.log("Using customer...", isUseCustomer);
    console.log("Using description...", productName);

    console.log(
      "Params are",
      connectedAccountId,
      productName,
      amount,
      applicationFee,
    );

    console.log("Id is ", connectedAccountId);
    const redirectUrl = `${getHostUrl(req)}/account/${encodeURIComponent(
      connectedAccountId,
    )}`;

    console.log("Redirect url is ", redirectUrl);

    let customer: Stripe.Customer | undefined = undefined;
    if (isUseCustomer) {
      customer = await StripeClient.customers.create(
        {
          name: "jorge",
          email: "jorgea@stripe.com",
        },
        destinationCharge
          ? undefined
          : {
              stripeAccount: connectedAccountId,
            },
      );
    }

    const session = await StripeClient.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: [
          {
            quantity: quantity,
            price_data: {
              currency: currency,
              unit_amount: amount,
              product_data: {
                name: productName,
                description: productName,
              },
            },
          },
        ],
        payment_intent_data: {
          application_fee_amount: useTransferAmount
            ? undefined
            : applicationFee,
          description: productName,
          ...(!isDestinationCharge
            ? {}
            : {
                transfer_data: {
                  destination: connectedAccountId,
                  ...(isUseTransferAmount
                    ? {
                        amount: amount - applicationFee,
                      }
                    : {}),
                },
              }),
          on_behalf_of: useOBO ? connectedAccountId : undefined,
        },
        mode: "payment",
        success_url: redirectUrl,
        cancel_url: redirectUrl,
        customer: customer?.id,
      },
      isDestinationCharge
        ? undefined
        : {
            stripeAccount: connectedAccountId,
          },
    );

    console.log("Created link!", session);

    if (!session.url) {
      throw new Error("Session did not contain url!");
    }

    res.redirect(303, session.url);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
