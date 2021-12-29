import { DetailsList, DetailsListLayoutMode, Dialog, IColumn, Stack, StackItem, Text, TextField } from '@fluentui/react'
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

    const getColumns = (): IColumn[] => {
        return [
            {
                key: 'id',
                name: 'id',
                minWidth: 100,
                onRender: (row: Stripe.PaymentIntent) => row.id,
            },
            {
                key: 'status',
                name: 'status',
                minWidth: 100,
                onRender: (row: Stripe.PaymentIntent) => row.status,
            },
            {
                key: 'amount',
                name: 'amount',
                minWidth: 100,
                onRender: (row: Stripe.PaymentIntent) => row.amount,
            },
            {
                key: 'currency',
                name: 'currency',
                minWidth: 100,
                onRender: (row: Stripe.PaymentIntent) => row.currency,
            },
            {
                key: 'payment_method',
                name: 'payment_method',
                minWidth: 100,
                onRender: (row: Stripe.PaymentIntent) => (row.payment_method as Stripe.PaymentMethod)?.type,
            },
            {
                key: 'app_fees',
                name: 'app_fees',
                minWidth: 100,
                onRender: (row: Stripe.PaymentIntent) => (row.application_fee_amount),
            },
        ]
    }

    return (
        <Dialog hidden={ false } onDismiss={ props.onDismiss } minWidth={ 800 } >
            <Stack>
                <StackItem>
                    <Text>Payments</Text>
                    { payments && <DetailsList
                        items={payments}
                        columns={getColumns()}
                        layoutMode={DetailsListLayoutMode.justified}
                    /> }
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