import * as React from 'react'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Stripe as StripeNamespace } from 'stripe'
import { StripePublicKey } from '../config/ClientConfig';
import { CheckoutForm } from './CheckoutForm';

type Props = {
    account: StripeNamespace.Account
    secret: string
    destinationCharge: boolean
    onSuccessfulPayment: () => void
}

export const PaymentsUIClientSecret: React.FC<Props> = (props) => {
    const [stripePromise, setStripePromise] = React.useState<Promise<Stripe | null> | undefined>(undefined)

    React.useEffect(() => {
        setStripePromise(undefined)

        const promise = loadStripe(StripePublicKey, props.destinationCharge ? {} : {
            stripeAccount: props.account.id
        })

        setStripePromise(promise)
    }, [props.account.id, props.destinationCharge])

    if (stripePromise === undefined) {
        return null
    }

    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm paymentIntentSecret={ props.secret } onSuccessfulPayment={ props.onSuccessfulPayment }/>
        </Elements>
    );
}