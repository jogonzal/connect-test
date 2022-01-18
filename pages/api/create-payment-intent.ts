import type { NextApiRequest, NextApiResponse } from 'next'
import { hostUrl } from '../../config/EnvironmentVariables';
import { StripeClient } from '../../config/StripeUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const connectedAccountId: string = req.body.connectedAccountId
    const productName: string = req.body.productName
    const amount: number = req.body.amount
    const applicationFee: number = req.body.applicationFee

    console.log('Id is ', connectedAccountId)
    const redirectUrl = `${hostUrl}?accountId=${encodeURIComponent(connectedAccountId)}`

    console.log('Redirect url is ', redirectUrl)

    const paymentIntent = await StripeClient.paymentIntents.create({
        payment_method_types: ['card'],
        amount: amount,
        currency: 'usd',
        application_fee_amount: applicationFee,
    },
    {
        stripeAccount: connectedAccountId,
    });
    
    console.log('Created payment intent!', paymentIntent)

    res.status(200).send(paymentIntent.client_secret)
  } catch (error) {
    const errorAsAny = error as any
    const errorMessage = (errorAsAny && errorAsAny.message) ? errorAsAny.message : 'unknown'
    console.log('Error while creating', error)
    res.status(500).json({ error: errorMessage })
  }
}
