import { useState } from 'react'
import './SearchForm.css'

interface SearchFormProps {
    onSearch: (walletAddress: string) => void
    loading: boolean
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
    const [walletId, setWalletId] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSearch = () => {
        if (!walletId.trim()) {
            setError('Please enter a wallet ID')
            return
        }

        setError(null)
        onSearch(walletId.trim())
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWalletId(e.target.value)
        if (error) {
            setError(null)
        }
    }

    return (
        <div className="search-form-container">
            <h1>User Search</h1>
            <p className="search-description">
                Search for user profile and delegation information by wallet address
            </p>

            <div className="search-form">
                <div className="search-input-container">
                    <input
                        type="text"
                        value={walletId}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter wallet address..."
                        className={`search-input ${error ? 'search-input-error' : ''}`}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading || !walletId.trim()}
                        className="search-button"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {error && (
                    <div className="search-error">
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchForm