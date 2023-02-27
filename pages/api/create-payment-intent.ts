import { Stripe } from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import { getHostUrl } from "../../config/EnvironmentVariables";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const connectedAccountId: string = req.body.connectedAccountId;
    const productName: string = req.body.productName;
    const amount: number = req.body.amount;
    const applicationFee: number = req.body.applicationFee;
    const destinationCharge: boolean = req.body.destinationCharge;
    const useTransferAmount: boolean = req.body.useTransferAmount;
    const useCustomer = true;

    console.log("Id is ", connectedAccountId);
    const redirectUrl = `${getHostUrl(req)}?accountId=${encodeURIComponent(
      connectedAccountId,
    )}`;

    console.log("Redirect url is ", redirectUrl);

    let customer: Stripe.Customer | undefined = undefined;
    if (useCustomer) {
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

    const paymentIntent = await StripeClient.paymentIntents.create(
      {
        payment_method_types: ["card"],
        amount: amount,
        description: productName,
        currency: "usd",
        application_fee_amount: useTransferAmount ? undefined : applicationFee,
        ...(!destinationCharge
          ? {}
          : {
              transfer_data: {
                destination: connectedAccountId,
                ...(useTransferAmount
                  ? {
                      amount: amount - applicationFee,
                    }
                  : {}),
              },
            }),
        customer: customer?.id,
      },
      destinationCharge
        ? undefined
        : {
            stripeAccount: connectedAccountId,
          },
    );

    console.log("Created payment intent!", paymentIntent);

    res.status(200).send(paymentIntent.client_secret);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
