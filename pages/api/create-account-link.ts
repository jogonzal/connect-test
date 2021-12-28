// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { hostUrl } from '../../config/EnvironmentVariables';
import { StripeClient } from '../../config/StripeUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const accountId: string = req.body.accountId
    console.log('Id is ', accountId)
    const redirectUrl = `${hostUrl}?accountId=${encodeURIComponent(accountId)}`

    console.log('Redirect url is ', redirectUrl)

    const accountLink = await StripeClient.accountLinks.create({
        account: accountId,
        refresh_url: redirectUrl,
        return_url: redirectUrl,
        type: 'account_onboarding',
    });
 
    console.log('Created link!', accountLink)

    res.status(200).json(accountLink)
  } catch (error) {
    const errorAsAny = error as any
    const errorMessage = (errorAsAny && errorAsAny.message) ? errorAsAny.message : 'unknown'
    console.log('Error while creating', error)
    res.status(500).json({ error: errorMessage })
  }
}
