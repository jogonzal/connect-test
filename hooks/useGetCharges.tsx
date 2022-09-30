import { useQuery } from "react-query";
import Stripe from "stripe";

const getCharges = async (
  account: Stripe.Account,
): Promise<Stripe.ApiList<Stripe.Charge>> => {
  const response = await fetch("/api/list-charges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connectedAccountId: account.id,
    }),
  });

  const charges: Stripe.Response<Stripe.ApiList<Stripe.Charge>> =
    await response.json();
  return charges;
};

export const useGetCharges = (account: Stripe.Account) => {
  return useQuery<Stripe.Charge[], Error>(
    ["GetCharges", account.id],
    async (): Promise<Stripe.Charge[]> => {
      console.log("Getting charges for ", account.id);
      const accounts = await getCharges(account);

      return accounts.data;
    },
  );
};
