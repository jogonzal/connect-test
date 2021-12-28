import * as React from 'react'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Stripe as StripeNamespace } from 'stripe'
import { StripePublicKey } from '../config/ClientConfig';
import { CheckoutForm } from './CheckoutForm';

type Props = {
    account: StripeNamespace.Account
    secret: string
}

export const PaymentsUIClientSecret: React.FC<Props> = (props) => {
    const [stripePromise, setStripePromise] = React.useState<Promise<Stripe | null> | undefined>(undefined)

    React.useEffect(() => {
        setStripePromise(undefined)

        const promise = loadStripe(StripePublicKey, {
            stripeAccount: props.account.id
        })

        setStripePromise(promise)
    }, [props.account.id])

    if (stripePromise === undefined) {
        return null
    }

    return (
        <Elements stripe={stripePromise}>
          <CheckoutForm paymentIntentSecret={ props.secret }/>
        </Elements>
      );
}