import { usePortfolioSearch } from '../../context/portfolio/usePortfolioSearch'
import { PortfolioValueState } from '../../context/portfolio/createPortfolioSearchContext'
import './PortfolioCard.css'

export function PortfolioCard() {
    const {
        usdWorth,
        aoWorth,
        arweaveBalance,
        lastUpdated,
        loading,
        error,
        refreshPortfolio
    } = usePortfolioSearch()

    // Helper function to format currency values
    const formatCurrency = (value: string, symbol: string) => {
        const num = parseFloat(value)
        if (isNaN(num)) return `${symbol}0.00`
        return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
    }

    // Helper function to format Arweave balance
    const formatArweaveBalance = (balance: number) => {
        return `${(balance / 1000000000000).toFixed(6)} AR`
    }

    // Helper function to format date
    const formatLastUpdated = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    // Component for individual portfolio value display
    const PortfolioValueDisplay = ({
        valueState,
        formatter,
        label
    }: {
        valueState: PortfolioValueState
        formatter: (value: string | number) => string
        label: string
    }) => {
        if (valueState.loading) {
            return (
                <div className="portfolio-worth-item">
                    <div className="worth-value loading">
                        <div className="loading-spinner-small" />
                        <span>Loading...</span>
                    </div>
                    <span className="worth-label">{label}</span>
                </div>
            )
        }

        if (valueState.error) {
            return (
                <div className="portfolio-worth-item">
                    <div className="worth-value error">
                        <span>Error</span>
                    </div>
                    <span className="worth-label error">{label}</span>
                    <span className="worth-error-detail">{valueState.error}</span>
                </div>
            )
        }

        return (
            <div className="portfolio-worth-item">
                <span className="worth-value">{formatter(valueState.value)}</span>
                <span className="worth-label">{label}</span>
                {valueState.lastUpdated && (
                    <span className="worth-last-updated">
                        Updated: {formatLastUpdated(valueState.lastUpdated)}
                    </span>
                )}
            </div>
        )
    }

    // If there's an overall error (initialization failed), show it
    if (error && !loading) {
        return (
            <div className="portfolio-card">
                <h3>Portfolio Worth</h3>
                <div className="portfolio-error">
                    <span>Error: {error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="portfolio-card">
            <h3>Portfolio Worth</h3>
            <div className="portfolio-content">
                <div className="portfolio-values">
                    <PortfolioValueDisplay
                        valueState={usdWorth}
                        formatter={(value) => formatCurrency(value as string, '$')}
                        label="USD Value"
                    />
                    <PortfolioValueDisplay
                        valueState={aoWorth}
                        formatter={(value) => `${formatCurrency(value as string, '')} AO`}
                        label="AO Value"
                    />
                    <PortfolioValueDisplay
                        valueState={arweaveBalance}
                        formatter={(value) => formatArweaveBalance(value as number)}
                        label="Arweave Balance"
                    />
                </div>
                <div className="portfolio-meta">
                    <span className="last-updated">
                        Last updated: {formatLastUpdated(lastUpdated)}
                    </span>
                    <button
                        className="refresh-button"
                        onClick={refreshPortfolio}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="loading-spinner-small" />
                                Refreshing...
                            </>
                        ) : (
                            <>🔄 Refresh</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PortfolioCard