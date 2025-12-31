import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useArweaveAOWallet } from '../../../../shared/context'
import './TokenBalance.css'

interface TokenBalanceProps {
  label: string
  fetchBalance: (address: string) => Promise<BigNumber>
}

function TokenBalance({ label, fetchBalance }: TokenBalanceProps) {
  const { address } = useArweaveAOWallet()
  const [balance, setBalance] = useState<BigNumber | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBalance = async () => {
    if (!address) {
      setBalance(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const fetchedBalance = await fetchBalance(address)
      setBalance(fetchedBalance)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBalance()
  }, [address])

  const formatBalance = (value: BigNumber): string => {
    return value.dividedBy(1e12).toFormat(2)
  }

  if (!address) {
    return (
      <div className="token-balance">
        <div className="balance-label">{label}</div>
        <div className="balance-connect-prompt">Connect wallet to view balance</div>
      </div>
    )
  }

  return (
    <div className="token-balance">
      <div className="balance-label">{label}</div>
      {loading ? (
        <div className="balance-loading">
          <div className="balance-spinner" />
        </div>
      ) : error ? (
        <div className="balance-error">
          <div className="error-text">{error}</div>
          <button onClick={loadBalance} className="balance-retry-button">
            Retry
          </button>
        </div>
      ) : (
        <div className="balance-display">
          {balance ? formatBalance(balance) : '0.00'}
        </div>
      )}
    </div>
  )
}

export default TokenBalance
