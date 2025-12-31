import { ReactNode } from 'react'

export interface WalletContextType {
  isConnected: boolean
  address: string | null
  arBalance: number | null
  isLoadingBalance: boolean
  connect: () => Promise<string>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

export interface WalletProviderProps {
  children: ReactNode
}
