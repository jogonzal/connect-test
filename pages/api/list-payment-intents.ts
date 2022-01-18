import type { NextApiRequest, NextApiResponse } from 'next'
import { hostUrl } from '../../config/EnvironmentVariables';
import { StripeClient } from '../../config/StripeUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const connectedAccountId: string = req.body.connectedAccountId

    console.log('Id is ', connectedAccountId)
    const redirectUrl = `${hostUrl}?accountId=${encodeURIComponent(connectedAccountId)}`

    console.log('Redirect url is ', redirectUrl)

    const paymentIntent = await StripeClient.paymentIntents.list({
        expand: ['data.payment_method']
    },
    {
        stripeAccount: connectedAccountId,
    });
    
    console.log('Obtained payment intents!', paymentIntent)

    res.status(200).send(paymentIntent)
  } catch (error) {
    const errorAsAny = error as any
    const errorMessage = (errorAsAny && errorAsAny.message) ? errorAsAny.message : 'unknown'
    console.log('Error while querying', error)
    res.status(500).json({ error: errorMessage })
  }
}
