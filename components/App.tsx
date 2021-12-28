import { PrimaryButton, TextField, Text, Separator, DetailsList, DetailsListLayoutMode, IColumn, Link, Stack, StackItem, IStackTokens, Dialog } from '@fluentui/react'
import * as React from 'react'
import { Stripe } from 'stripe'
import { AccountDetailsDialog } from './AccountDetailsDialog'
import { CheckoutExperienceDialog } from './CheckoutExperienceDialog'
import { PaymentUIExperienceDialog } from './PaymentUIExperienceDialog'

export const App: React.FC = () => {
    const [accounts, setAccounts] = React.useState<Stripe.Response<Stripe.ApiList<Stripe.Account>> | undefined>(undefined)
    const [accountName, setAccountName] = React.useState('')
    const [currentAccountFullDetails, setCurrentAccountFullDetails] = React.useState<Stripe.Account | undefined>(undefined)
    const [showCheckoutUIDialogForMerchant, setShowCheckoutDialogForMerchant] = React.useState<Stripe.Account | undefined>(undefined)
    const [showPaymentUIDialogForMerchant, setShowPaymentUIDialogForMerchant] = React.useState<Stripe.Account | undefined>(undefined)

    const refreshAccounts = async () => {
        const listAccountsResponse = await fetch("/api/list-connected-accounts")
        const accounts = await listAccountsResponse.json()
  
        setAccounts(accounts)
    }

    React.useEffect(() => {
        refreshAccounts()
    }, [])
    
    const onCreateAccountClicked = async () => {
        const accountsResponse = await fetch('/api/create-connected-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: accountName,
            }),
        })
        await accountsResponse.json()
        await refreshAccounts()
    }
    
    const onAccountNameChanged = (ev: any, val?: string) => {
        setAccountName(val ?? '')
    }

    const setCurrentAccountAndReset = (row: Stripe.Account) => {
        console.log('Switching to account ', row)
    }

    const onboardAccount = async (row: Stripe.Account) => {
        const accountsResponse = await fetch('/api/create-account-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountId: row.id,
            }),
        })
        const accountLink: Stripe.Response<Stripe.AccountLink> = await accountsResponse.json()
        window.location.href = accountLink.url
    }

    const viewAccountFullDetails = (row: Stripe.Account) => {
        setCurrentAccountFullDetails(row)
    }

    const checkoutForMerchant = (row: Stripe.Account) => {
        setShowCheckoutDialogForMerchant(row)
    }

    const paymentUIForMerchant = (row: Stripe.Account) => {
        setShowPaymentUIDialogForMerchant(row)
    }

    const getColumns = (): IColumn[] => {
        return [
            {
                key: 'name',
                name: 'name',
                minWidth: 100,
                onRender: (row: Stripe.Account) => row?.business_profile?.name,
            },
            {
                key: 'type',
                name: 'type',
                minWidth: 100,
                onRender: (row: Stripe.Account) => row.type,
            },
            {
                key: 'charges_enabled',
                name: 'charges_enabled',
                minWidth: 100,
                onRender: (row: Stripe.Account) => {
                    if (row.charges_enabled) {
                        return <Text>y <Link onClick={ () => checkoutForMerchant(row) }>Checkout</Link> <Link onClick={ () => paymentUIForMerchant(row)}>Payment UI</Link></Text>
                    } else {
                        return <Link onClick={ () => onboardAccount(row) }>Onboard link</Link>
                    }
                },
            },
            {
                key: 'details_submitted',
                name: 'details_submitted',
                minWidth: 100,
                onRender: (row: Stripe.Account) => {
                    if (row.details_submitted) {
                        return 'y'
                    } else {
                        return <Link onClick={ () => onboardAccount(row) }>Onboard link</Link>
                    }
                },
            },
            {
                key: 'loginAs',
                name: 'loginAs',
                minWidth: 100,
                onRender: (row: Stripe.Account) => {
                    return (
                        <>
                            <Link onClick={ () => setCurrentAccountAndReset(row) }>Login as</Link>
                        </>
                    )
                },
            },
            {
                key: 'viewFull',
                name: 'ViewFullDetails',
                minWidth: 100,
                onRender: (row: Stripe.Account) => {
                    return (
                        <>
                            <Link onClick={ () => viewAccountFullDetails(row) }>View</Link>
                        </>
                    )
                },
            },
        ]
    }
    
    const stackTokens: IStackTokens = { maxWidth: 1000 };

    return (
      <Stack horizontalAlign='center'>
        <StackItem tokens={ stackTokens }>
            <Stack>
                <Text variant='large'>Special app</Text>
                <Text>Total Accounts: { accounts && accounts.data.length }</Text>
                <Separator />
                <Stack horizontal>
                    <PrimaryButton onClick={ onCreateAccountClicked }>Create account</PrimaryButton>
                    <TextField onChange={ onAccountNameChanged } value={accountName} placeholder='Account name' />
                </Stack>
                <Separator />
                {accounts && <DetailsList
                    items={accounts.data}
                    columns={getColumns()}
                    layoutMode={DetailsListLayoutMode.justified}
                />
                }
            </Stack>
        </StackItem>
        <AccountDetailsDialog account={ currentAccountFullDetails } onDismiss={ () => setCurrentAccountFullDetails(undefined) } />
        <CheckoutExperienceDialog account={ showCheckoutUIDialogForMerchant } onDismiss={ () => setCurrentAccountFullDetails(undefined) } />
        <PaymentUIExperienceDialog account= { showPaymentUIDialogForMerchant } onDismiss={ () => setCurrentAccountFullDetails(undefined) } />
      </Stack>
    )
}