import { PrimaryButton, TextField } from '@fluentui/react'
import * as React from 'react'

export const App: React.FC = () => {
    const [accounts, setAccounts] = React.useState<any>(undefined)
    const [accountName, setAccountName] = React.useState('')

    const refreshAccounts = async () => {
        const accountsResponse = await fetch("/api/list-connected-accounts")
        const accounts = await accountsResponse.json()
  
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
    
    return (
      <div>
        <h1>Special app</h1>
        <p>Accounts: { accounts && accounts.data.length }</p>
        <PrimaryButton onClick={ onCreateAccountClicked }>Create account</PrimaryButton>
        <TextField label='Name' onChange={ onAccountNameChanged } value={accountName} />
      </div>
    )
}