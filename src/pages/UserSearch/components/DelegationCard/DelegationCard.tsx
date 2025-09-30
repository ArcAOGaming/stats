import { useDelegationSearch } from '../../context/delegation/useDelegationSearch'
import { formatDelegationPreferences, formatTimestamp, createDebugView } from '../../utils/delegation/delegationFormatters'
import { formatAddress } from '../../utils/formatters'
import './DelegationCard.css'

interface DelegationCardProps {
    walletAddress: string
}

export function DelegationCard({ walletAddress }: DelegationCardProps) {
    const { delegations, loading, error } = useDelegationSearch()

    // Use walletAddress for debugging
    console.log('DelegationCard for wallet:', walletAddress)

    if (loading) {
        return (
            <div className="delegation-card">
                <h3>Delegation Information</h3>
                <div className="delegation-loading">
                    <div className="loading-spinner" />
                    <span>Loading delegation data...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="delegation-card">
                <h3>Delegation Information</h3>
                <div className="delegation-error">
                    <span>Error: {error}</span>
                </div>
            </div>
        )
    }

    const formattedData = formatDelegationPreferences(delegations)
    const debugData = createDebugView(delegations)

    return (
        <div className="delegation-card">
            <h3>Delegation Information</h3>
            <div className="delegation-content">
                {formattedData.hasValidData && formattedData.preferences.length > 0 ? (
                    <div className="delegation-preferences">
                        <h4>Delegation Preferences</h4>
                        {formattedData.preferences.map((preference, index) => (
                            <div key={index} className="preference-entry">
                                <div className="preference-header">
                                    <span className="project-name">{preference.projectName}</span>
                                    <span className="percentage">{preference.percentage}%</span>
                                </div>
                                <div className="preference-details">
                                    <div className="info-row">
                                        <span>Delegated To:</span>
                                        <span className="wallet-address">{formatAddress(preference.walletTo)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Delegation Weight:</span>
                                        <span>{preference.factor}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Last Updated:</span>
                                        <span>{formatTimestamp(preference.lastUpdate.getTime())}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formattedData.lastUpdate && (
                            <div className="delegation-summary">
                                <div className="info-row">
                                    <span>Last Update:</span>
                                    <span>{formatTimestamp(formattedData.lastUpdate.getTime())}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="no-delegations">
                        <span>No delegation preferences found for this wallet address</span>
                        {Object.keys(delegations).length > 0 && (
                            <div className="debug-section">
                                <div className="raw-data-note">
                                    <small>Raw delegation data available but not in expected format</small>
                                </div>
                                <div className="debug-data">
                                    <h5>Debug: Raw Delegation Data</h5>
                                    <div className="debug-entries">
                                        {debugData.map((entry, index) => (
                                            <div key={index} className="debug-entry">
                                                <div className="debug-key">{entry.key}:</div>
                                                <div className="debug-value">{entry.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DelegationCard