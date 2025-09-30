import { usePortfolioSearch } from '../../context/portfolio/usePortfolioSearch'
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

    if (loading) {
        return (
            <div className="portfolio-card">
                <h3>Portfolio Worth</h3>
                <div className="portfolio-loading">
                    <div className="loading-spinner" />
                    <span>Calculating portfolio worth...</span>
                </div>
            </div>
        )
    }

    if (error) {
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
                    <div className="portfolio-worth-item">
                        <span className="worth-value usd">{formatCurrency(usdWorth, '$')}</span>
                        <span className="worth-label">USD Value</span>
                    </div>
                    <div className="portfolio-worth-item">
                        <span className="worth-value ao">{formatCurrency(aoWorth, '')} AO</span>
                        <span className="worth-label">AO Value</span>
                    </div>
                    <div className="portfolio-worth-item">
                        <span className="worth-value ar">{formatArweaveBalance(arweaveBalance)}</span>
                        <span className="worth-label">Arweave Balance</span>
                    </div>
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
                        🔄 Refresh
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PortfolioCard