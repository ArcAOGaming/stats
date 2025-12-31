import { useState } from 'react'
import './WithdrawButton.css'

type WithdrawStatus = 'idle' | 'loading' | 'success' | 'error'

interface WithdrawButtonProps {
  label: string
  onWithdraw: () => Promise<any>
  onSuccess?: () => void
}

function WithdrawButton({ label, onWithdraw, onSuccess }: WithdrawButtonProps) {
  const [status, setStatus] = useState<WithdrawStatus>('idle')
  const [message, setMessage] = useState<string>('')

  const handleWithdraw = async () => {
    setStatus('loading')
    setMessage('')
    try {
      await onWithdraw()
      setStatus('success')
      setMessage(`${label} withdrawal successful`)
      
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
        onSuccess?.()
      }, 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Withdrawal failed'
      setStatus('error')
      setMessage(errorMessage)
      
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  return (
    <div className="withdraw-button-container">
      <button
        onClick={handleWithdraw}
        disabled={status === 'loading'}
        className={`withdraw-button ${status}`}
      >
        {status === 'loading' && (
          <div className="button-spinner" />
        )}
        {status === 'loading' ? 'Withdrawing...' : `Withdraw ${label}`}
      </button>
      {message && (
        <div className={`status-message ${status}`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default WithdrawButton
