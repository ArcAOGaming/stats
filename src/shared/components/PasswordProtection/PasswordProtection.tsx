import type { ReactNode } from 'react'
import { useState } from 'react'
import './PasswordProtection.css'


const SALT = "123jrfbnfq34ofib3098udrvbdgn10478hsdvnc9y28134h"
// Cryptographically secure hash function using SHA-256
const hash = async (str: string): Promise<string> => {
  const input = str + SALT
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashBase64 = btoa(String.fromCharCode(...hashArray))
  return hashBase64
}

// For development: uncomment to generate hash for a new password
// generateHash('password123')

// This is a SHA-256 hash of "password123" encoded in base64
const CORRECT_HASH = 'pTKwRVB2qa52oVV62Z5z0iSPvy+8A+80E1kAdAgXbTU='

interface PasswordProtectionProps {
  children: ReactNode
}

function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const hashedPassword = await hash(password)
      console.log('Entered password hash:', hashedPassword)
      console.log('Expected hash:', CORRECT_HASH)
      if (hashedPassword === CORRECT_HASH) {
        setIsAuthenticated(true)
        setError('')
      } else {
        setError('Access denied. Please try again.')
        setPassword('')
      }
    } catch (err) {
      setError('Authentication error. Please try again.')
      setPassword('')
    }
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="password-protection">
      <div className="password-protection-panel">
        <h2>Access Required</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="• • • • • • • •"
            className="password-protection-input"
            autoComplete="new-password"
          />
          {error && <div className="password-protection-error">{error}</div>}
          <button type="submit" className="password-protection-button">
            Verify Access
          </button>
        </form>
      </div>
    </div>
  )
}

export default PasswordProtection
