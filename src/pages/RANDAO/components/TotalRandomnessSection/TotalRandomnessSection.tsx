import { useRandAOStats, formatRandomnessCount } from '../../../../utils/randao'
import './TotalRandomnessSection.css'

export function TotalRandomnessSection() {
    const {
        totalRandomnessCreated,
        loading: statsLoading,
        error: statsError
    } = useRandAOStats()

    return (
        <div className="randao-stats">
            <h2>Total Randomness Created</h2>
            <div className="total-randomness-section">
                {statsLoading ? (
                    <div className="loading-spinner" />
                ) : statsError ? (
                    <div className="error-message">{statsError}</div>
                ) : totalRandomnessCreated !== null ? (
                    <div className="big-number">
                        <span className="big-number-value">
                            {formatRandomnessCount(totalRandomnessCreated)}
                        </span>
                        <span className="big-number-label">Total Randomness Values</span>
                    </div>
                ) : (
                    <div className="no-data">No data available</div>
                )}
            </div>
        </div>
    )
}