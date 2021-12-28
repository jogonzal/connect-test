import { PrimaryButton, TextField, Text, Separator, DetailsList, DetailsListLayoutMode, IColumn, Link } from '@fluentui/react'
import * as React from 'react'
import { Stripe } from 'stripe'

export const App: React.FC = () => {
    const [accounts, setAccounts] = React.useState<Stripe.Response<Stripe.ApiList<Stripe.Account>> | undefined>(undefined)
    const [accountName, setAccountName] = React.useState('')

    const refreshAccounts = async () => {
        const listAccountsResponse = await fetch("/api/list-connected-accounts")
        const accounts = await listAccountsResponse.json()
  
        setAccounts(accounts)
    }

    React.useEffect(() => {
        refreshAccounts()
    })
    
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

    const getColumns = (): IColumn[] => {
        return [
            {
                key: 'name',
                name: 'name',
                minWidth: 200,
                onRender: (row: Stripe.Account) => row?.business_profile?.name,
            },
            {
                key: 'type',
                name: 'type',
                minWidth: 200,
                onRender: (row: Stripe.Account) => row.type,
            },
            {
                key: 'charges_enabled',
                name: 'charges_enabled',
                minWidth: 200,
                onRender: (row: Stripe.Account) => row.charges_enabled ? 'y' : 'n',
            },
            {
                key: 'details_submitted',
                name: 'details_submitted',
                minWidth: 200,
                onRender: (row: Stripe.Account) => row.details_submitted ? 'y' : 'n',
            },
            {
                key: 'loginAs',
                name: 'loginAs',
                minWidth: 200,
                onRender: (row: Stripe.Account) => {
                    return (
                        <>
                            <Link onClick={ () => setCurrentAccountAndReset(row) }>Login as</Link>
                            <Link onClick={ () => onboardAccount(row) }>Onboard as</Link>
                        </>
                    )
                },
            },
        ]
    }
    
    return (
      <div>
        <Text variant='large'>Special app</Text>
        <Text>Total Accounts: { accounts && accounts.data.length }</Text>
        <Separator />
        <PrimaryButton onClick={ onCreateAccountClicked }>Create account</PrimaryButton>
        <TextField label='Name' onChange={ onAccountNameChanged } value={accountName} />
        <Separator />
        {accounts && <DetailsList
            items={accounts.data}
            columns={getColumns()}
            layoutMode={DetailsListLayoutMode.justified}
          />
        }

      </div>
    )
}