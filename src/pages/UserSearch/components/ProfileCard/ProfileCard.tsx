import { useProfileSearch } from '../../context/profile/useProfileSearch'
import { formatAddress } from '../../utils/formatters'
import './ProfileCard.css'

interface ProfileCardProps {
    walletAddress: string
}

export function ProfileCard({ walletAddress }: ProfileCardProps) {
    const { profiles, loading, error } = useProfileSearch()

    if (loading) {
        return (
            <div className="profile-card">
                <h3>Profile Information</h3>
                <div className="profile-loading">
                    <div className="loading-spinner" />
                    <span>Loading profile data...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="profile-card">
                <h3>Profile Information</h3>
                <div className="profile-error">
                    <span>Error: {error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-card">
            <h3>Profile Information</h3>
            <div className="profile-content">
                <div className="profile-wallet">
                    <div className="info-row">
                        <span>Wallet Address:</span>
                        <span className="wallet-address">{formatAddress(walletAddress)}</span>
                    </div>
                    {profiles.length > 0 && (
                        <div className="info-row">
                            <span>Profiles Found:</span>
                            <span>{profiles.length}</span>
                        </div>
                    )}
                </div>

                {profiles.length > 0 ? (
                    <div className="profiles-list">
                        <h4>Profile Registry Entries</h4>
                        {profiles.map((profile, index) => (
                            <div key={index} className="profile-entry">
                                <div className="info-row">
                                    <span>Profile ID:</span>
                                    <span className="profile-id">
                                        {profile.ProfileId ? formatAddress(profile.ProfileId) : 'N/A'}
                                    </span>
                                </div>
                                {profile.CallerAddress && (
                                    <div className="info-row">
                                        <span>Caller Address:</span>
                                        <span className="caller-address">
                                            {formatAddress(profile.CallerAddress)}
                                        </span>
                                    </div>
                                )}
                                {Object.entries(profile)
                                    .filter(([key]) => !['ProfileId', 'CallerAddress'].includes(key))
                                    .map(([key, value]) => (
                                        <div key={key} className="info-row">
                                            <span>{key}:</span>
                                            <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-profiles">
                        <span>No profiles found for this wallet address</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfileCard