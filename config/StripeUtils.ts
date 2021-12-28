import { Stripe } from 'stripe'
import { StripePrivateKey } from './EnvironmentVariables'

export const StripeClient = new Stripe(StripePrivateKey, {
    apiVersion: '2020-08-27' // Current npm package version
})