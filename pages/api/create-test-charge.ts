import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accountId: string = req.body.accountId;
    console.log("Id is ", accountId);
    const destinationCharge = req.body.destinationCharge;
    const transferAmount = req.body.transferAmount;
    const description = req.body.description;
    const amount = req.body.amount;
    const fee = req.body.fee;
    const obo = req.body.obo;
    const currency = req.body.currency;

    console.log("Currency is", currency);

    let payment;
    if (destinationCharge) {
      payment = await StripeClient.paymentIntents.create({
        amount: amount,
        currency: currency ?? "USD",
        payment_method: "pm_card_bypassPending",
        confirmation_method: "manual",
        confirm: true,
        application_fee_amount: transferAmount ? undefined : fee,
        transfer_data: {
          destination: accountId,
          amount: transferAmount ? amount - fee : undefined,
        },
        on_behalf_of: obo ? accountId : undefined,
      });
    } else {
      payment = await StripeClient.paymentIntents.create(
        {
          amount: amount,
          currency: currency ?? "USD",
          description: description,
          payment_method: "pm_card_bypassPending",
          confirmation_method: "manual",
          confirm: true,
        },
        {
          stripeAccount: accountId,
        },
      );
    }

    console.log("Created payment!", payment);

    res.status(200).json(payment);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
