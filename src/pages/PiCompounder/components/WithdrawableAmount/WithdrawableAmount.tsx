import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import './WithdrawableAmount.css'

interface WithdrawableAmountProps {
  label: string
  fetchAmount: () => Promise<BigNumber>
  onAmountLoaded?: (amount: BigNumber) => void
}

function WithdrawableAmount({ label, fetchAmount, onAmountLoaded }: WithdrawableAmountProps) {
  const [amount, setAmount] = useState<BigNumber | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAmount = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedAmount = await fetchAmount()
      setAmount(fetchedAmount)
      onAmountLoaded?.(fetchedAmount)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch amount'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAmount()
  }, [])

  const formatAmount = (value: BigNumber): string => {
    return value.dividedBy(1e12).toFormat(2)
  }

  return (
    <div className="withdrawable-amount">
      <div className="amount-label">{label}</div>
      {loading ? (
        <div className="amount-loading">
          <div className="amount-spinner" />
        </div>
      ) : error ? (
        <div className="amount-error">
          <div className="error-text">{error}</div>
          <button onClick={loadAmount} className="amount-retry-button">
            Retry
          </button>
        </div>
      ) : (
        <div className="amount-display">
          {amount ? formatAmount(amount) : '0.00'}
        </div>
      )}
    </div>
  )
}

export default WithdrawableAmount
