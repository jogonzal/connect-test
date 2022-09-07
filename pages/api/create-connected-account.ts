import type { NextApiRequest, NextApiResponse } from 'next'
import { StripeClient } from '../../config/StripeUtils';
import { Guid } from '../../utils/Guid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const name: string = req.body.name
    console.log('Name is ', name)
    const type: string = req.body.type
    console.log('Type is ', type)

    const account = await StripeClient.accounts.create({
      type: type === 'standard' ? 'standard' : 'express',
      country: 'US',
      email: `test${Guid.newGuid()}@example.com`,
      business_profile: {
          name: name,
      },
      ...(type === 'standard' ?
        {} :
        {
          capabilities: {
            card_payments: {
              requested: true,
            },
            transfers: {
              requested: true,
            }
          }
        }
      )
    });

    console.log('Created!', account)

    res.status(200).json(account)
  } catch (error) {
    const errorAsAny = error as any
    const errorMessage = (errorAsAny && errorAsAny.message) ? errorAsAny.message : 'unknown'
    console.log('Error while creating', error)
    res.status(500).json({ error: errorMessage })
  }
}
