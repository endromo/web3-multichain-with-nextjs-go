'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { EthersProvider, Web3Provider, ViemProvider, web3Utils, ERC20Token } from '@/lib/web3-utils'

export function Web3Dashboard() {
  const { address, isConnected, chain } = useAccount()
  const [activeProvider, setActiveProvider] = useState<'ethers' | 'web3' | 'viem'>('ethers')
  const [balance, setBalance] = useState<string>('0')
  const [tokenBalance, setTokenBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string>('')

  // USDC contract address (Ethereum mainnet)
  const USDC_ADDRESS = '0xA0b86a33E6441c8C673f4c8b0c8C8e8c8e8c8e8c'

  useEffect(() => {
    if (address && isConnected) {
      fetchBalances()
    }
  }, [address, isConnected, activeProvider, chain])

  const fetchBalances = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      let ethBalance = '0'
      let usdcBalance = '0'

      switch (activeProvider) {
        case 'ethers':
          const ethersProvider = new EthersProvider(chain?.id || 1)
          ethBalance = await ethersProvider.getBalance(address)
          
          const usdcToken = new ERC20Token(USDC_ADDRESS, chain?.id || 1)
          const rawUsdcBalance = await usdcToken.getBalance(address)
          usdcBalance = (parseInt(rawUsdcBalance) / 1e6).toString() // USDC has 6 decimals
          break

        case 'web3':
          const web3Provider = new Web3Provider(chain?.id || 1)
          ethBalance = await web3Provider.getBalance(address)
          usdcBalance = await web3Provider.callContract(USDC_ADDRESS, [
            { inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], type: 'function' }
          ], 'balanceOf', [address])
          usdcBalance = (parseInt(usdcBalance) / 1e6).toString()
          break

        case 'viem':
          const viemProvider = new ViemProvider(chain?.id || 1)
          ethBalance = await viemProvider.getBalance(address as `0x${string}`)
          break
      }

      setBalance(ethBalance)
      setTokenBalance(usdcBalance)
    } catch (error) {
      console.error('Error fetching balances:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestTransaction = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      let hash = ''
      
      switch (activeProvider) {
        case 'ethers':
          const ethersProvider = new EthersProvider(chain?.id || 1)
          await ethersProvider.connectWallet()
          hash = await ethersProvider.sendTransaction(address, '0.001') // Send to self
          break

        case 'web3':
          const web3Provider = new Web3Provider(chain?.id || 1)
          await web3Provider.connectWallet()
          hash = await web3Provider.sendTransaction(address, '0.001')
          break

        case 'viem':
          const viemProvider = new ViemProvider(chain?.id || 1)
          await viemProvider.connectWallet()
          hash = await viemProvider.sendTransaction(address as `0x${string}`, '0.001')
          break
      }

      setTxHash(hash)
    } catch (error) {
      console.error('Transaction error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signTestMessage = async () => {
    if (!address) return
    
    try {
      const message = `Hello from ${activeProvider.toUpperCase()}! Timestamp: ${Date.now()}`
      
      switch (activeProvider) {
        case 'ethers':
          const ethersProvider = new EthersProvider(chain?.id || 1)
          const signer = await ethersProvider.connectWallet()
          if (signer) {
            const signature = await signer.signMessage(message)
            console.log('Ethers signature:', signature)
            
            // Verify signature
            const isValid = web3Utils.verifySignature(message, signature, address)
            console.log('Signature valid:', isValid)
          }
          break

        case 'web3':
          const web3Provider = new Web3Provider(chain?.id || 1)
          // Web3.js signing would require additional setup
          console.log('Web3.js signing not implemented in this demo')
          break

        case 'viem':
          // Viem signing would use wagmi hooks
          console.log('Viem signing handled by wagmi hooks')
          break
      }
    } catch (error) {
      console.error('Signing error:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Web3 Provider Dashboard</h2>
        <p className="text-gray-400">Connect your wallet to test different Web3 providers</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Web3 Provider Dashboard</h2>
        <div className="flex gap-2">
          {(['ethers', 'web3', 'viem'] as const).map((provider) => (
            <button
              key={provider}
              onClick={() => setActiveProvider(provider)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeProvider === provider
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {provider}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <p className="text-gray-400">Active Provider</p>
            <p className="text-xl font-bold capitalize">{activeProvider}</p>
          </div>
          
          <div>
            <p className="text-gray-400">Network</p>
            <p className="text-lg">{web3Utils.getChainName(chain?.id || 1)}</p>
          </div>

          <div>
            <p className="text-gray-400">Address</p>
            <p className="font-mono text-sm">{web3Utils.formatAddress(address || '')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-400">ETH Balance</p>
            <p className="text-2xl font-bold">
              {loading ? 'Loading...' : `${parseFloat(balance).toFixed(4)} ETH`}
            </p>
          </div>

          <div>
            <p className="text-gray-400">USDC Balance</p>
            <p className="text-lg">
              {loading ? 'Loading...' : `${parseFloat(tokenBalance).toFixed(2)} USDC`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={fetchBalances}
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 disabled:opacity-50 px-4 py-3 rounded-lg font-semibold transition-all"
        >
          {loading ? 'Loading...' : 'Refresh Balances'}
        </button>

        <button
          onClick={sendTestTransaction}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 disabled:opacity-50 px-4 py-3 rounded-lg font-semibold transition-all"
        >
          Send Test TX
        </button>

        <button
          onClick={signTestMessage}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 disabled:opacity-50 px-4 py-3 rounded-lg font-semibold transition-all"
        >
          Sign Message
        </button>
      </div>

      {txHash && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <p className="text-gray-400 mb-2">Transaction Hash:</p>
          <p className="font-mono text-sm break-all text-green-400">{txHash}</p>
          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-sm"
          >
            View on Etherscan →
          </a>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-900 rounded-lg">
        <h3 className="font-bold mb-2">Provider Comparison:</h3>
        <div className="text-sm space-y-1 text-gray-300">
          <p><strong>Ethers.js:</strong> Popular, well-documented, TypeScript support</p>
          <p><strong>Web3.js:</strong> Original Ethereum library, extensive ecosystem</p>
          <p><strong>Viem:</strong> Modern, TypeScript-first, tree-shakeable, fast</p>
        </div>
      </div>
    </div>
  )
}