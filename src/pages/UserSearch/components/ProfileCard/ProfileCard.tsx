import { useProfileSearch } from '../../context/profile/useProfileSearch'
import { formatAddress } from '../../utils/formatters'
import './ProfileCard.css'

interface ProfileCardProps {
    walletAddress: string
}

// Helper function to format dates
function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch {
        return dateString
    }
}

// Helper function to create Arweave image URL
function getArweaveImageUrl(transactionId?: string): string | null {
    if (!transactionId) return null
    return `https://arweave.net/${transactionId}`
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
                        <h4>Profile Details</h4>
                        {profiles.map((profileInfo, index) => {
                            const profile = profileInfo.Profile
                            return (
                                <div key={index} className="profile-entry">
                                    {/* Profile Images */}
                                    {(profile?.ProfileImage || profile?.CoverImage) && (
                                        <div className="profile-images">
                                            {profile.CoverImage && (
                                                <div className="cover-image-container">
                                                    <img
                                                        src={getArweaveImageUrl(profile.CoverImage)!}
                                                        alt="Cover"
                                                        className="cover-image"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {profile.ProfileImage && (
                                                <div className="profile-image-container">
                                                    <img
                                                        src={getArweaveImageUrl(profile.ProfileImage)!}
                                                        alt="Profile"
                                                        className="profile-image"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Profile Information */}
                                    <div className="profile-details">
                                        {profile?.UserName && (
                                            <div className="info-row">
                                                <span>Username:</span>
                                                <span className="profile-username">{profile.UserName}</span>
                                            </div>
                                        )}
                                        {profile?.DisplayName && (
                                            <div className="info-row">
                                                <span>Display Name:</span>
                                                <span className="profile-display-name">{profile.DisplayName}</span>
                                            </div>
                                        )}
                                        {profile?.Description && (
                                            <div className="info-row">
                                                <span>Description:</span>
                                                <span className="profile-description">{profile.Description}</span>
                                            </div>
                                        )}
                                        {profile?.DateCreated && (
                                            <div className="info-row">
                                                <span>Created:</span>
                                                <span className="profile-date">{formatDate(profile.DateCreated)}</span>
                                            </div>
                                        )}
                                        {profile?.DateUpdated && (
                                            <div className="info-row">
                                                <span>Updated:</span>
                                                <span className="profile-date">{formatDate(profile.DateUpdated)}</span>
                                            </div>
                                        )}

                                        {/* Owner Information */}
                                        {profileInfo.Owner && (
                                            <div className="info-row">
                                                <span>Owner:</span>
                                                <span className="wallet-address">{formatAddress(profileInfo.Owner)}</span>
                                            </div>
                                        )}

                                        {/* Additional profile properties */}
                                        {profile && Object.entries(profile)
                                            .filter(([key]) => !['UserName', 'DisplayName', 'Description', 'ProfileImage', 'CoverImage', 'DateCreated', 'DateUpdated'].includes(key))
                                            .map(([key, value]) => (
                                                <div key={key} className="info-row">
                                                    <span>{key}:</span>
                                                    <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )
                        })}
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