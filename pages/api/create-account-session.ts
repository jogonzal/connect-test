import type { NextApiRequest, NextApiResponse } from 'next'
import { hostUrl } from '../../config/EnvironmentVariables';
import { StripeClient } from '../../config/StripeUtils';
import { Stripe } from 'stripe'
const STRIPE_API_VERSION = '2020-08-27';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const accountId: string = req.body.accountId
    console.log('Id is ', accountId)
    const redirectUrl = `${hostUrl}?accountId=${encodeURIComponent(accountId)}`

    console.log('Redirect url is ', redirectUrl)

    const accountSessionResource = Stripe.StripeResource.extend({
      create: Stripe.StripeResource.method({
        method: 'POST',
        path: '/account_sessions',
      }),
    });
  
    // Specify the API version to include the beta header
    const accountSessionResponse = await new accountSessionResource(
      StripeClient,
    ).create(
      {
        account: accountId,
      },
      {
        apiVersion: `${STRIPE_API_VERSION}; embedded_connect_beta=v1`,
      },
    );

    (accountSessionResponse as any).publicKey = process.env.NEXT_PUBLIC_stripe_public_key;
    res.status(200).json(accountSessionResponse)
  } catch (error) {
    const errorAsAny = error as any
    const errorMessage = (errorAsAny && errorAsAny.message) ? errorAsAny.message : 'unknown'
    console.log('Error while creating', error)
    res.status(500).json({ error: errorMessage })
  }
}
