import { Dialog, Stack, StackItem, Text, TextField } from '@fluentui/react'
import * as React from 'react'
import { Stripe } from 'stripe'

type Props = {
    account: Stripe.Account | undefined
    onDismiss: () => void
}

export const AccountDetailsDialog: React.FC<Props> = (props) => {
    const [payments, setPayments] = React.useState<undefined | (Stripe.PaymentIntent[])>(undefined)

    React.useEffect(() => {
        const runAsync = async () => {
            setPayments(undefined)
            if (!props.account) {
                return
            }
            const response = await fetch('/api/list-payment-intents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    connectedAccountId: props.account.id
                })
            })

            const paymentIntents: Stripe.Response<Stripe.ApiList<Stripe.PaymentIntent>> = await response.json()
            setPayments(paymentIntents.data)
        }
        runAsync()
    }, [props.account])

    const currentAccountFullDetails = props.account
    if (!currentAccountFullDetails) {
        return null
    }

    return (
        <Dialog hidden={ false } onDismiss={ props.onDismiss } minWidth={ 800 } >
            <Stack>
                <StackItem>
                    <Text>Payments</Text>
                    <TextField multiline rows={4} value={ JSON.stringify(payments) } />
                </StackItem>
                <StackItem>
                    <Text variant='large'>Account {currentAccountFullDetails.id}</Text>
                </StackItem>
                <StackItem>
                    <TextField multiline rows={ 20 } value={ JSON.stringify(currentAccountFullDetails, null, 2) } width={ 800 } />
                </StackItem>
            </Stack>
        </Dialog>
    )
}