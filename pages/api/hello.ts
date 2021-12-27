// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Kitten } from '../../storage/MongoUtils';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const silence = new Kitten({ name: 'Silence' });
    const savedKitten = await silence.save()

    res.status(200).json(savedKitten)
  } catch (error) {
    const errorAsAny = error as any
    const errorMessage = (errorAsAny && errorAsAny.message) ? errorAsAny.message : 'unknown'
    res.status(500).json({ error: errorMessage })
  }
}
