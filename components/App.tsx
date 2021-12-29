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
    const [showCheckoutDialogForMerchant, setShowCheckoutDialogForMerchant] = React.useState<Stripe.Account | undefined>(undefined)
    const [showPaymentDialogForMerchant, setShowPaymentDialogForMerchant] = React.useState<Stripe.Account | undefined>(undefined)

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
        setShowPaymentDialogForMerchant(row)
    }

    const getColumns = (): IColumn[] => {
        return [
            {
                key: 'name',
                name: 'Account Name',
                minWidth: 100,
                onRender: (row: Stripe.Account) => row?.business_profile?.name,
            },
            {
                key: 'type',
                name: 'Account Type',
                minWidth: 100,
                onRender: (row: Stripe.Account) => row.type,
            },
            {
                key: 'charges_enabled',
                name: 'Charges enabled',
                minWidth: 100,
                onRender: (row: Stripe.Account) => {
                    if (row.charges_enabled) {
                        return <>y <Link onClick={ () => checkoutForMerchant(row) }>Create payment</Link></>
                    } else {
                        return <>n <Link onClick={ () => onboardAccount(row) }>Onboard link</Link> </>
                    }
                },
            },
            {
                key: 'viewFull',
                name: 'View details',
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
                <StackItem>
                    <Stack>
                        <StackItem>
                            <Text variant='large'>Merchant management test app</Text>
                        </StackItem>
                        <StackItem>
                            <Text>Total Accounts: { accounts && accounts.data.length }</Text>
                        </StackItem>
                    </Stack>
                </StackItem>
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
        <CheckoutExperienceDialog
            account={ showCheckoutDialogForMerchant }
            onDismiss={ () => setShowCheckoutDialogForMerchant(undefined) }
            onSuccessfulPayment={ (account) =>  {
                setCurrentAccountFullDetails(account)
                setShowCheckoutDialogForMerchant(undefined)
            } }
        />
        <PaymentUIExperienceDialog account= { showPaymentDialogForMerchant } onDismiss={ () => setShowPaymentDialogForMerchant(undefined) } />
      </Stack>
    )
}