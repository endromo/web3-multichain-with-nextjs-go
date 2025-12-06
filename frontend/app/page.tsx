'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useDisconnect, useSignMessage } from 'wagmi'
import { formatEther } from 'viem'
import { useState } from 'react'
import { TenderlySimulation } from '@/components/TenderlySimulation'

export default function Home() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()
  const { signMessage } = useSignMessage()
  const [signature, setSignature] = useState<string>('')

  const handleSignMessage = async () => {
    const message = 'Hello Web3 World!'
    signMessage(
      { message },
      {
        onSuccess: (data) => {
          setSignature(data)
          console.log('Signature:', data)
        },
      }
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Web3 Wallet Connect
          </h1>
          <ConnectButton showBalance={true} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Info Section */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Wallet Information</h2>
            
            {isConnected ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400">Connected Address</p>
                    <p className="font-mono break-all bg-gray-900 p-3 rounded-lg">
                      {address}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400">Network</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <p className="text-lg">{chain?.name}</p>
                    </div>
                  </div>

                  {balance && (
                    <div>
                      <p className="text-gray-400">Balance</p>
                      <p className="text-3xl font-bold">
                        {formatEther(balance.value)} {balance.symbol}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSignMessage}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Sign Test Message
                    </button>
                    <button
                      onClick={() => disconnect()}
                      className="bg-gradient-to-r from-red-600 to-pink-500 hover:opacity-90 px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      Disconnect
                    </button>
                  </div>

                  {signature && (
                    <div className="mt-4">
                      <p className="text-gray-400">Signature</p>
                      <p className="font-mono text-sm break-all bg-gray-900 p-3 rounded-lg">
                        {signature}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">👛</div>
                <h3 className="text-xl text-gray-300">
                  Connect your wallet to get started
                </h3>
                <p className="text-gray-500 mt-2">
                  Supported: MetaMask, Coinbase, WalletConnect, and more
                </p>
              </div>
            )}
          </div>

          {/* Tenderly Simulation Section */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
            <TenderlySimulation />
          </div>
        </div>
      </div>
    </main>
  )
}