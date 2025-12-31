/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import './ConnectArweaveAOWalletButton.css';
import { useArweaveAOWallet } from '../../context/wallet';

interface ConnectArweaveAOWalletButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  isConnected?: boolean;
}

const ConnectArweaveAOWalletButton: React.FC<ConnectArweaveAOWalletButtonProps> = ({
  onConnect,
  onDisconnect,
  isConnected: externalIsConnected,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const {
    isConnected: contextIsConnected,
    connect: contextConnect,
    disconnect: contextDisconnect,
    address,
    arBalance,
    isLoadingBalance,
    refreshBalance
  } = useArweaveAOWallet();

  // Wallet logos that rotate every 4 seconds
  const walletLogos = [
    '/beacon-wallet-transparent.png',
    '/wander-logo-transparent.png'
  ];

  // Use external isConnected prop if provided, otherwise use context value
  const isConnected = typeof externalIsConnected !== 'undefined' ? externalIsConnected : contextIsConnected;

  // Rotate wallet logos every 5 seconds with flip animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prevIndex) => (prevIndex + 1) % walletLogos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [walletLogos.length]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const address = await contextConnect();
      onConnect?.(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    contextDisconnect();
    onDisconnect?.();
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
  };

  return (
    <div className="wallet-container">
      {!isConnected ? (
        <button
          className="wallet-button wallet-button-primary"
          onClick={handleConnect}
          disabled={isLoading}
        >
          <div className="wallet-logo-container">
            {walletLogos.map((logo, index) => (
              <img
                key={logo}
                src={logo}
                alt="Wallet Logo"
                className={`wallet-logo ${index === currentLogoIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          <span className="wallet-button-text">{isLoading ? 'Connecting...' : 'Connect AO'}</span>
        </button>
      ) : (
        <div className="wallet-connected">
          {address && (
            <div className="profile-container">
              <div className="user-profile">
                <div className="profile-info">
                  <div className="profile-name">
                    {`${address.slice(0, 6)}...${address.slice(-4)}`}
                  </div>
                  <div
                    className="profile-address"
                    onClick={() => handleCopyAddress(address)}
                    title="Click to copy address"
                  >
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </div>
                  {arBalance !== null && (
                    <div className="profile-balance">
                      {isLoadingBalance ? 'Loading...' : `${arBalance.toFixed(4)} AR`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <button
            className="wallet-button wallet-button-secondary"
            onClick={handleDisconnect}
          >
            <span className="wallet-button-icon">🔌</span>
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectArweaveAOWalletButton;
