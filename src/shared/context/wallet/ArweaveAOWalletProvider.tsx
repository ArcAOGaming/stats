import { ArweaveDataService } from "ao-js-sdk";
import { useState, useEffect } from "react";
import { WalletContext } from "./ArweaveAOWalletContext";
import { WalletProviderProps } from "./types";

export const ArweaveAOWalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [arBalance, setArBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  // Initialize ArweaveDataService
  const arweaveDataService = ArweaveDataService.autoConfiguration();

  const handleConnect = async () => {
    if (window.arweaveWallet) {
      try {
        console.log('Connecting to wallet...');
        await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
        const addr = await window.arweaveWallet.getActiveAddress();
        if (addr) {
          console.log('Connected to wallet:', addr);
          setAddress(addr);
          setIsConnected(true);
          // Save connection state to localStorage
          localStorage.setItem('walletConnected', 'true');
          return addr;
        }
        throw new Error('No address returned from wallet');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        localStorage.removeItem('walletConnected'); // Clear on connection error
        throw error;
      }
    }
    throw new Error('Arweave wallet not found');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setArBalance(null);
    localStorage.removeItem('walletConnected');
  };

  const refreshBalance = async () => {
    if (!address) return;
    
    setIsLoadingBalance(true);
    try {
      console.log('Fetching AR balance for address:', address);
      const balance = await arweaveDataService.getWalletBalance(address);
      // Convert from winston to AR (1 AR = 1e12 winston)
      const arAmount = balance / 1e12;
      setArBalance(arAmount);
      console.log('AR balance updated:', arAmount);
    } catch (error) {
      console.error('Error fetching AR balance:', error);
      setArBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Check for existing connection on mount with persistence and retry mechanism
  useEffect(() => {
    // Check if user has previously connected (from localStorage)
    const hasConnectedBefore = localStorage.getItem('walletConnected') === 'true';
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout: NodeJS.Timeout | null = null;

    const checkExistingConnection = async () => {
      if (window.arweaveWallet) {
        try {
          console.log('Checking existing wallet connection...');
          const permissions = await window.arweaveWallet.getPermissions();
          
          if (permissions.includes('ACCESS_ADDRESS')) {
            const addr = await window.arweaveWallet.getActiveAddress();
            if (addr) {
              console.log('Wallet already connected:', addr);
              setAddress(addr);
              setIsConnected(true);
              localStorage.setItem('walletConnected', 'true');
              return true; // Successfully connected
            }
          }
          
          // If we got here but user had connected before, try to reconnect
          if (hasConnectedBefore && retryCount < maxRetries) {
            console.log(`Auto-reconnect attempt ${retryCount + 1} of ${maxRetries}...`);
            try {
              await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
              const addr = await window.arweaveWallet.getActiveAddress();
              if (addr) {
                console.log('Auto-reconnect successful:', addr);
                setAddress(addr);
                setIsConnected(true);
                localStorage.setItem('walletConnected', 'true');
                return true; // Successfully reconnected
              }
            } catch (reconnectError) {
              console.warn('Auto-reconnect attempt failed:', reconnectError);
            }
          }
          
          return false; // Not connected and couldn't reconnect
        } catch (error) {
          console.error('Error checking existing connection:', error);
          return false;
        }
      } else {
        console.log('ArweaveWallet not found yet, will retry if needed');
        return false;
      }
    };

    // Initial check with retry mechanism
    const attemptConnection = async () => {
      const connected = await checkExistingConnection();
      
      // If not connected but user had connected before, retry after delay
      if (!connected && hasConnectedBefore && retryCount < maxRetries) {
        retryCount++;
        console.log(`Scheduling retry ${retryCount} of ${maxRetries} in ${retryCount * 1000}ms`);
        
        retryTimeout = setTimeout(async () => {
          await attemptConnection();
        }, retryCount * 1000); // Increasing backoff
      }
    };

    // Start the connection process
    attemptConnection();
    
    // Clean up any pending retry attempts on unmount
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);

  // Fetch balance when address changes
  useEffect(() => {
    if (address && isConnected) {
      refreshBalance();
    }
  }, [address, isConnected]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        arBalance,
        isLoadingBalance,
        connect: handleConnect,
        disconnect: handleDisconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
