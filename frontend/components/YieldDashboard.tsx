'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import axios from 'axios'

interface Chain {
  chainId: number
  name: string
  nativeToken: string
  protocols: string[]
}

interface Pool {
  id: string
  protocol: string
  apy: number
  tvl: number
  riskScore: number
  chainId: number
}

export function YieldDashboard() {
  const { address } = useAccount()
  const [chains, setChains] = useState<Chain[]>([])
  const [pools, setPools] = useState<Pool[]>([])
  const [selectedChain, setSelectedChain] = useState<number>(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchChains()
    fetchPools(selectedChain)
  }, [selectedChain])

  const fetchChains = async () => {
    try {
      const response = await axios.get('/api/v1/chains')
      setChains(response.data.chains)
    } catch (error) {
      console.error('Error fetching chains:', error)
    }
  }

  const fetchPools = async (chainId: number) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/v1/pools/${chainId}`)
      setPools(response.data.pools)
    } catch (error) {
      console.error('Error fetching pools:', error)
    } finally {
      setLoading(false)
    }
  }

  const createStrategy = async (poolId: string, amount: string) => {
    if (!address) return
    
    try {
      const response = await axios.post('/api/v1/strategy/create', {
        name: `Auto-Compound ${poolId}`,
        type: 'AUTO_COMPOUND',
        chainId: selectedChain,
        poolAddress: poolId,
        riskTolerance: 3,
        minDeposit: amount,
        maxDeposit: amount,
        parameters: {
          autoHarvest: true,
          compoundThreshold: '100', // $100
          maxGasPrice: '50', // 50 gwei
        }
      })
      
      console.log('Strategy created:', response.data)
    } catch (error) {
      console.error('Error creating strategy:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Multichain Yield Engine</h2>
        <div className="flex gap-2">
          {chains.map((chain) => (
            <button
              key={chain.chainId}
              onClick={() => setSelectedChain(chain.chainId)}
              className={`px-4 py-2 rounded-lg ${
                selectedChain === chain.chainId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading pools...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <div
              key={pool.id}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{pool.protocol}</h3>
                  <p className="text-sm text-gray-400">Chain: {selectedChain}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  pool.riskScore <= 3 ? 'bg-green-500/20 text-green-400' :
                  pool.riskScore <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  Risk: {pool.riskScore}/10
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">APY</p>
                  <p className="text-3xl font-bold text-green-400">
                    {pool.apy.toFixed(2)}%
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">TVL</p>
                  <p className="text-lg">
                    ${(pool.tvl / 1e6).toFixed(1)}