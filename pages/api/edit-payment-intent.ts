import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

function getRandomString(length: number) {
  const randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length),
    );
  }
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("Editing payment intent");

  try {
    const id: string = req.body.id;
    const accountId: string = req.body.accountId;

    console.log("Id is ", id);
    console.log("account id is ", accountId);

    // This is the full process if you only have the platform destination charge
    // const paymentOnPlatform = await StripeClient.paymentIntents.retrieve(
    //   "pi_3N6JL7LirQdaQn8E1Lpn7Dui",
    // );

    // const latestCharge = await StripeClient.charges.retrieve(
    //   paymentOnPlatform.latest_charge as string,
    // );

    // const transfer = await StripeClient.transfers.retrieve(
    //   latestCharge.transfer as string,
    // );

    // console.log("transfer is ", transfer);

    // const payment = await StripeClient.charges.retrieve(
    //   transfer.destination_payment as string,
    //   undefined,
    //   {
    //     stripeAccount: transfer.destination as string,
    //   },
    // );

    // This is the process for a connected account destination charge
    const customer = await StripeClient.customers.create(
      {
        email: `jorgeatest+${getRandomString(5)}@stripe.com`,
        name: "JorgeA test",
        description: "JorgeA test",
      },
      {
        stripeAccount: accountId,
      },
    );
    const payment = await StripeClient.charges.update(
      id,
      {
        description: `Custom description is here! ${getRandomString(10)}}`,
        customer: customer.id,
        metadata: {
          order_id: "6735",
          field2: "custom field 2",
          randomContent: getRandomString(10),
        },
      },
      {
        stripeAccount: accountId,
      },
    );

    console.log("payment is ", payment);

    res.status(200).send(payment);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while updating account", error);
    res.status(500).json({ error: errorMessage });
  }
}
