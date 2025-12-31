import './PiCompounder.css'
import { 
  fetchWithdrawableAo, 
  fetchWithdrawablePi, 
  performWithdrawAo, 
  performWithdrawPi,
  fetchAOBalance,
  fetchPIBalance
} from './piCompounderService'
import { WithdrawableAmount, WithdrawButton, TokenBalance } from './components'

function PiCompounder() {
  return (
    <div className="pi-compounder">
      <div className="pi-compounder-container">
        <h1 className="page-title">Pi-Compounder</h1>
        
        <div className="withdrawable-section">
          <h2>Withdrawable Amounts</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>AO</h3>
              <div className="stat-content">
                <WithdrawableAmount
                  label="Amount"
                  fetchAmount={fetchWithdrawableAo}
                />
                <WithdrawButton
                  label="AO"
                  onWithdraw={performWithdrawAo}
                />
              </div>
            </div>

            <div className="stat-card">
              <h3>PI</h3>
              <div className="stat-content">
                <WithdrawableAmount
                  label="Amount"
                  fetchAmount={fetchWithdrawablePi}
                />
                <WithdrawButton
                  label="PI"
                  onWithdraw={performWithdrawPi}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="withdrawable-section">
          <h2>Token Balances</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>AO</h3>
              <div className="stat-content">
                <TokenBalance
                  label="Balance"
                  fetchBalance={fetchAOBalance}
                />
              </div>
            </div>

            <div className="stat-card">
              <h3>PI</h3>
              <div className="stat-content">
                <TokenBalance
                  label="Balance"
                  fetchBalance={fetchPIBalance}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PiCompounder
