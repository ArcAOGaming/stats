import { useContext } from 'react'
import { WalletContext } from './ArweaveAOWalletContext'

export const useArweaveAOWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useArweaveAOWallet must be used within an ArweaveAOWalletProvider')
  }
  return context
}
