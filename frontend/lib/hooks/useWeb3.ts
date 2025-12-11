import { useState, useEffect, useCallback } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { EthersProvider, Web3Provider, ViemProvider, web3Utils } from '../web3-utils'

export type Web3ProviderType = 'ethers' | 'web3' | 'viem'

export interface UseWeb3Return {
  provider: EthersProvider | Web3Provider | ViemProvider | null
  providerType: Web3ProviderType
  setProviderType: (type: Web3ProviderType) => void
  balance: string
  loading: boolean
  error: string | null
  refreshBalance: () => Promise<void>
  sendTransaction: (to: string, value: string) => Promise<string>
  signMessage: (message: string) => Promise<string>
  isValidAddress: (address: string) => boolean
  formatAddress: (address: string, chars?: number) => string
}

export function useWeb3(): UseWeb3Return {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  const [providerType, setProviderType] = useState<Web3ProviderType>('ethers')
  const [provider, setProvider] = useState<EthersProvider | Web3Provider | ViemProvider | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize provider when type or chain changes
  useEffect(() => {
    let newProvider: EthersProvider | Web3Provider | ViemProvider

    switch (providerType) {
      case 'ethers':
        newProvider = new EthersProvider(chainId)
        break
      case 'web3':
        newProvider = new Web3Provider(chainId)
        break
      case 'viem':
        newProvider = new ViemProvider(chainId)
        break
      default:
        newProvider = new EthersProvider(chainId)
    }

    setProvider(newProvider)
  }, [providerType, chainId])

  // Refresh balance when address, provider, or connection status changes
  useEffect(() => {
    if (address && isConnected && provider) {
      refreshBalance()
    }
  }, [address, isConnected, provider])

  const refreshBalance = useCallback(async () => {
    if (!address || !provider) return

    setLoading(true)
    setError(null)

    try {
      let newBalance = '0'

      switch (providerType) {
        case 'ethers':
          newBalance = await (provider as EthersProvider).getBalance(address)
          break
        case 'web3':
          newBalance = await (provider as Web3Provider).getBalance(address)
          break
        case 'viem':
          newBalance = await (provider as ViemProvider).getBalance(address as `0x${string}`)
          break
      }

      setBalance(newBalance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance')
      console.error('Balance fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [address, provider, providerType])

  const sendTransaction = useCallback(async (to: string, value: string): Promise<string> => {
    if (!provider) throw new Error('Provider not initialized')
    if (!address) throw new Error('Wallet not connected')

    setLoading(true)
    setError(null)

    try {
      let txHash = ''

      switch (providerType) {
        case 'ethers':
          await (provider as EthersProvider).connectWallet()
          txHash = await (provider as EthersProvider).sendTransaction(to, value)
          break
        case 'web3':
          await (provider as Web3Provider).connectWallet()
          txHash = await (provider as Web3Provider).sendTransaction(to, value)
          break
        case 'viem':
          await (provider as ViemProvider).connectWallet()
          txHash = await (provider as ViemProvider).sendTransaction(to as `0x${string}`, value)
          break
      }

      // Refresh balance after transaction
      setTimeout(() => refreshBalance(), 2000)
      
      return txHash
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [provider, providerType, address, refreshBalance])

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!provider) throw new Error('Provider not initialized')
    if (!address) throw new Error('Wallet not connected')

    setError(null)

    try {
      switch (providerType) {
        case 'ethers':
          const signer = await (provider as EthersProvider).connectWallet()
          if (!signer) throw new Error('Failed to connect wallet')
          return await signer.signMessage(message)
        
        case 'web3':
          // Web3.js signing implementation would go here
          throw new Error('Web3.js message signing not implemented')
        
        case 'viem':
          // Viem signing would typically use wagmi hooks
          throw new Error('Use wagmi useSignMessage hook for Viem')
        
        default:
          throw new Error('Unsupported provider type')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Message signing failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [provider, providerType, address])

  return {
    provider,
    providerType,
    setProviderType,
    balance,
    loading,
    error,
    refreshBalance,
    sendTransaction,
    signMessage,
    isValidAddress: web3Utils.isValidAddress,
    formatAddress: web3Utils.formatAddress
  }
}